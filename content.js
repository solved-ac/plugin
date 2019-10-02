function loadScript(src) {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    s.onload = function() {
        this.remove();
    };
    
    (document.head || document.documentElement).appendChild(s);
}

loadScript('3rdparty/tagify.2.28.4.min.js')
loadScript('voting.js')

const getPrefs = (key, defaultValue) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (value) => {
            if (!value[key]) resolve(defaultValue)
            else resolve(value[key])
        })
    })
}

function setPrefs(key, value) {
    var params = {}
    params[key] = value
    chrome.storage.local.set(params)
}

function levelName(level) {
    const prefix = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby']
    const roman = ['I', 'II', 'III', 'IV', 'V']

    return prefix[Math.floor((level - 1) / 5)] + ' '  + roman[4 - (level - 1) % 5]
}

function levelShortDisplayName(level) {
    const prefix = ['B', 'S', 'G', 'P', 'D', 'R']
    const roman = ['I', 'II', 'III', 'IV', 'V']

    return '<b>' + prefix[Math.floor((level - 1) / 5)] + '</b> '  + roman[4 - (level - 1) % 5]
}

function levelCssClass(level) {
    const prefix = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby']

    return prefix[Math.floor((level - 1) / 5)]
}

function levelText(level) {
    if (level == 0) return "<span>Unranked</span>"
    return "<span class=\"text-" + levelCssClass(level) + "\">" + levelName(level) + "</span>"
}

function kudekiLevelText(level) {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
    return "<span class=\"text-kudeki\">Ghudegy " + roman[level - 1] + "</span>"
}

function levelLabelUnlisted() {
    return "<span class=\"level_hidden\">00"
    + "</span><img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/unlisted.svg") + "\">"
}

function levelLabel(level) {
    if (level === null) return levelLabelUnlisted()
    if (level == -1) level = 0
    return "<span class=\"level_hidden\">" + ('0' + level).slice(-2)
    + "</span><img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/" + level + ".svg") + "\">"
}

function kudekiLevelLabel(level) {
    return "<img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/ka" + level + ".svg") + "\">"
}

function matchCurrentURL(regex) {
    return regex.test(window.location.toString())
}

function isBOJStack() {
    return matchCurrentURL(/^https?:\/\/stack\.acmicpc\.net\/.*?$/i)
}

function isProblemPage() {
    return matchCurrentURL(/^https?:\/\/www\.acmicpc\.net\/problem\/[0-9]+\/?$/i)
}

function isUserPage() {
    return matchCurrentURL(/^https?:\/\/www\.acmicpc\.net\/(user)\/[A-Za-z0-9_]+$/i)
}

function isNotUserOrVsPage() {
    return !matchCurrentURL(/^https?:\/\/www\.acmicpc\.net\/(user|vs)\/.*$/i)
}

function algorithmToTag(item, showTagsInEnglish) {
    if (showTagsInEnglish) {
        return {
            value: item.full_name_en,
            searchBy: item.full_name_ko + ',' + item.short_name_en + ',' + item.aliases,
            algorithm_id: item.algorithm_id
        }
    } else {
        return {
            value: item.full_name_ko,
            searchBy: item.full_name_en + ',' + item.short_name_en + ',' + item.aliases,
            algorithm_id: item.algorithm_id
        }
    }
}

async function initializeVoting(token, problemId, defaultLevel, myVote) {
    var params = {
        "token": token
    }

    const currentUser = await (await fetch("https://api.solved.ac/validate_token.php",
        {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
    ).json()
    
    var user = currentUser
    if (user.level < 16) return
    if (!document.querySelector(".label-success") && user.user_id !== "solvedac") return
    
    const algorithms = await (await fetch("https://api.solved.ac/algorithms.php")).json()
    const showTagsInEnglish = JSON.parse(await getPrefs('show_tags_in_english', 'false'))

    const bottom = document.querySelector(".col-md-12:nth-child(4)")
    var visibleState = "poll_shown"
    if (myVote) visibleState = "poll_hidden"
    bottom.outerHTML += "<div class=\"col-md-12\"><section id=\"problem_difficulty\" class=\"" + visibleState + "\"><div class=\"headline\" onclick=\"togglePoll()\"><h2>난이도 투표 <small>펼치기/접기</small></h2></div></section></div>"
    
    const difficultySectionConainer = document.getElementById("problem_difficulty")
    const difficultySection = document.createElement("div")
    difficultySection.className = "poll"
    difficultySectionConainer.appendChild(difficultySection)

    const commentCaption = document.createElement("span")
    commentCaption.className = "vote_caption"
    commentCaption.innerText = "난이도 의견"
    difficultySection.appendChild(commentCaption)

    const difficultySelector = document.createElement("select")
    difficultySelector.name = "difficulty_selector"
    difficultySelector.className = "difficulty_selector"

    var difficultyValueMin = 1
    if (user.user_id === "solvedac") {
        difficultyValueMin = 0
    }
    for (var i = difficultyValueMin; i <= 30; i++) {
        const difficultyItem = document.createElement("option")
        difficultyItem.value = i
        difficultyItem.innerText = levelName(i)
        difficultyItem.className = levelCssClass(i)
        difficultySelector.appendChild(difficultyItem)
    }

    difficultySelector.selectedIndex = (defaultLevel - 1);
    difficultySection.appendChild(difficultySelector);
    difficultySection.appendChild(document.createElement("br"))

    const commentSection = document.createElement("textarea")
    commentSection.id = "problem_comment"
    commentSection.setAttribute("onkeydown", "onPollKeyDown(event)")
    if (myVote) commentSection.value = myVote.comment
    difficultySection.appendChild(commentSection)
    difficultySection.appendChild(document.createElement("br"))

    const whitelist = algorithms.map((algo) => algorithmToTag(algo, showTagsInEnglish))
    var selectedAlgorithms = []
    if (myVote) selectedAlgorithms = myVote.algorithms.map((algo) => algorithmToTag(algo, showTagsInEnglish))

    const algorithmCaption = document.createElement("span")
    algorithmCaption.className = "vote_caption"
    algorithmCaption.innerText = "알고리즘 분류 의견"
    difficultySection.appendChild(algorithmCaption)

    const algorithmSection = document.createElement("input")
    algorithmSection.id = "algorithm_input"
    algorithmSection.name = "basic"
    algorithmSection.setAttribute("onkeydown", "onPollKeyDown(event)")
    difficultySection.appendChild(algorithmSection)

    const whitelistScript = document.createElement("script")
    whitelistScript.innerHTML = "var whitelist = JSON.parse(" + JSON.stringify(JSON.stringify(whitelist)) + ");"
    difficultySection.appendChild(whitelistScript)

    const algorithmInputScript = document.createElement("script")
    algorithmInputScript.innerHTML = "var algorithmSuggestionInput=new Tagify(document.querySelector('#algorithm_input'),"
                                    + "{enforceWhitelist: true, whitelist: whitelist, dropdown: {enabled: 1, classname: 'algorithm_dropdown'}, delimiters: '[|]'});"
                                    + "algorithmSuggestionInput.addTags(JSON.parse(" + JSON.stringify(JSON.stringify(selectedAlgorithms)) + "))"
    difficultySection.appendChild(algorithmInputScript)

    const sendButton = document.createElement("button")
    sendButton.className = "btn btn-primary"
    sendButton.id = "poll_submit"
    sendButton.type = "submit"
    sendButton.innerText = "이렇게 제출하기"
    sendButton.style.marginTop = "16px"
    sendButton.setAttribute("onclick", "sendVote('" + token + "'," + problemId + ")")
    difficultySection.appendChild(sendButton)
}

async function addLevelIndicators() {
    if (isProblemPage()) {
        const problemIdContainer = document.querySelector("ul.problem-menu li a")
        const problemId = problemIdContainer.innerText.replace(/[^0-9.]/g, "")
        const problemInfo = document.querySelector("div.page-header")

        const levelData = await (await fetch("https://api.solved.ac/problem_level.php?id=" + problemId)).json()
        const difficultyVotes = await (await fetch("https://api.solved.ac/question_level_votes.php?id=" + problemId)).json()
        
        if (levelData.level == null) {
            var description = document.createElement("span")
            description.innerText = "아직 solved.ac 데이터베이스에 등록되지 않은 문제입니다. 내일 오전 6시부터 난이도 의견 제출이 가능합니다."
            problemInfo.appendChild(description)
            return
        }

        const nick = document.querySelector("ul.loginbar li:first-child a").innerText.trim()
        var votedFlag = false
        var myVote

        var titleBadge = document.createElement("span")
        titleBadge.className = "title_badge"
        titleBadge.innerHTML = levelLabel(levelData.level) + " " + levelText(levelData.level)
        problemInfo.appendChild(titleBadge)

        if (levelData.kudeki_level) {
            var titleBadge = document.createElement("span")
            titleBadge.className = "title_badge"
            titleBadge.innerHTML = " / " + kudekiLevelLabel(levelData.kudeki_level) + " " + kudekiLevelText(levelData.kudeki_level)
            problemInfo.appendChild(titleBadge)
        }

        var standard = (difficultyVotes.length > 0 && difficultyVotes[0].user_id == "solvedac")

        const hideOtherVotes = JSON.parse(await getPrefs('hide_other_votes', 'false'))
        const showTagsInEnglish = JSON.parse(await getPrefs('show_tags_in_english', 'false'))

        if (!document.querySelector(".label-success") && nick !== "solvedac") return
        if (levelData.level != 0 && !standard) {
            var difficultyVotesContainer = document.createElement("div");
            difficultyVotesContainer.className = "difficulty_vote_container"
            
            for (var i = 0; i < difficultyVotes.length; i++) {
                var vote = difficultyVotes[i]
                if (vote.user_id === nick) {
                    votedFlag = true
                    myVote = vote
                }
                if (hideOtherVotes) continue

                var difficultyVote = document.createElement("div")
                difficultyVote.className = "difficulty_vote"
                difficultyVote.innerHTML = "<a href=\"/user/" + vote.user_id + "\">"
                                                + "<span class=\"text-" + levelCssClass(vote.user_level) + "\">"
                                                    + levelLabel(vote.user_level) + vote.user_id
                                                + "</span>"
                                            + "</a> ➔ " + levelLabel(vote.voted_level)
                difficultyVote.appendChild(document.createElement("br"))
            
                var voteComment = document.createElement("div")
                voteComment.innerText = vote.comment
                if (!vote.comment) {
                    voteComment.classList.add("comment_none")
                    voteComment.innerText = "난이도 의견을 입력하지 않았습니다"
                }
                if (vote.algorithms) {
                    for (var j = 0; j < vote.algorithms.length; j++) {
                        var algo = vote.algorithms[j]
                        var algorithmTag = document.createElement("div")
                        if (showTagsInEnglish) {
                            algorithmTag.innerText = algo.full_name_en
                        } else {
                            algorithmTag.innerText = algo.full_name_ko
                        }
                        algorithmTag.className = "algorithm_tag"
                        voteComment.appendChild(algorithmTag)
                    }
                }
                difficultyVote.appendChild(voteComment)
                difficultyVotesContainer.appendChild(difficultyVote)
            }
            problemInfo.appendChild(difficultyVotesContainer)
        }

        if (standard) {
            var standardIndicator = document.createElement("img")
            standardIndicator.src = chrome.extension.getURL("svg/mark-verified.svg")
            standardIndicator.style.width = "16px"
            standardIndicator.style.height = "16px"
            standardIndicator.style.marginLeft = "8px"
            standardIndicator.style.verticalAlign = "text-top"
            standardIndicator.alt = "solved.ac 표준"
            standardIndicator.title = "solved.ac 표준"
            problemInfo.appendChild(standardIndicator)
    
            if (nick === "solvedac") {
                for (var i = 0; i < difficultyVotes.length; i++) {
                    var vote = difficultyVotes[i]
                    if (vote.user_id === nick) {
                        votedFlag = true
                        myVote = vote
                    }
                }
            }
        }
        
        if (!standard || nick === "solvedac") {
            chrome.storage.local.get('token', function(items) {
                var defaultLevel = 1
                if (levelData.level) defaultLevel = levelData.level
                if (votedFlag) defaultLevel = myVote.voted_level
                initializeVoting(items.token, problemId, defaultLevel, myVote)
            })
        }
    }

    if (isNotUserOrVsPage()) {
        var pattern = /^[/]problem[/][0-9]+$/i
        var problemLinks = document.getElementsByTagName("a")
        problemLinks = [].slice.call(problemLinks, 0)
        problemLinks
            .filter(function (item) {
                return item.getAttribute("href") && pattern.test(item.getAttribute("href"))
            })
            .forEach(async function (item, index) {
                const problemId = item.getAttribute("href").split("/")[2]
            
                const levelData = await (await fetch("https://api.solved.ac/problem_level.php?id=" + problemId)).json()
                if (levelData.kudeki_level) {
                    item.insertAdjacentHTML('afterbegin', kudekiLevelLabel(levelData.kudeki_level))
                }
                item.insertAdjacentHTML('afterbegin', levelLabel(levelData.level))
            })
    }

    if (isUserPage()) {
        var userId = document.querySelector(".page-header h1").innerText.trim()
        var userStaticsTable = document.querySelector("#statics tbody")

        const userData = await (await fetch("https://api.solved.ac/user_information.php?id=" + userId)).json()
        if (!userData) return

        var newRow = document.createElement("tr")
        var newRowHeader = document.createElement("th")
        newRowHeader.innerText = "solved.ac"
        var newRowDescription = document.createElement("td")
        newRowDescription.innerHTML = "<a href=\"https://solved.ac/" + userData.user_id + "\">"
                                        + "<span class=\"text-" + levelCssClass(userData.level) + "\">"
                                            + levelLabel(userData.level) + "<b>" + userData.user_id + "</b>"
                                        + "</span>"
                                        + "</a>"
        newRow.appendChild(newRowHeader)
        newRow.appendChild(newRowDescription)
        userStaticsTable.appendChild(newRow)
    }
}

getPrefs('hide_indicators', 'false')
    .then((hideIndicators) => {
        if (!isBOJStack() && JSON.parse(hideIndicators) === false) {
            addLevelIndicators();
        }
    })

if (!isBOJStack()) $('.dropdown-toggle').dropdown()