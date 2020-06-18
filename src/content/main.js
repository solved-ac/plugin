async function addLevelIndicators() {
    if (isProblemPage()) {
        const problemIdContainer = document.querySelector("ul.problem-menu li a")
        const problemId = problemIdContainer.innerText.replace(/[^0-9.]/g, "")
        const problemInfo = document.querySelector("div.page-header")

        const levelData = await (await fetch("https://api.solved.ac/v2/problems/show.json?id=" + problemId)).json()

        if (!levelData.success || !levelData.result.problems.length) {
            var description = document.createElement("span")
            description.innerText = "아직 solved.ac 데이터베이스에 등록되지 않은 문제입니다."
            problemInfo.appendChild(description)
            return
        }

        const problem = levelData.result.problems[0]
        const nick = document.querySelector("ul.loginbar li:first-child a").innerText.trim()

        var titleBadge = document.createElement("span")
        titleBadge.className = "title_badge"
        titleBadge.innerHTML = levelLabel(problem.level, problem.level_locked) + " " + levelText(problem.level, problem.level_locked)
        problemInfo.appendChild(titleBadge)

        var standard = (problem.level_locked)

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
        }

        const showTagsInEnglish = JSON.parse(await getPrefs('show_tags_in_english', 'false'))

        if (document.querySelector(".label-success") || nick === "solvedac") {
            if (problem.tags) {
                problemInfo.appendChild(document.createElement("br"))
            }
            for (var j = 0; j < problem.tags.length; j++) {
                var algo = problem.tags[j]
                var algorithmTag = document.createElement("a")
                algorithmTag.setAttribute("href", "https://solved.ac/problems/tags/" + algo.tag_name)
                if (showTagsInEnglish) {
                    algorithmTag.innerText = algo.full_name_en
                } else {
                    algorithmTag.innerText = algo.full_name_ko
                }
                algorithmTag.className = "algorithm_tag"
                problemInfo.appendChild(algorithmTag)
            }
        }

        problemInfo.appendChild(document.createElement("br"))
        var solvedAcIndicator = document.createElement("span")
        solvedAcIndicator.innerText = "난이도 제공: solved.ac"
        problemInfo.appendChild(solvedAcIndicator)

        if (document.querySelector(".label-success") || nick === "solvedac") {
            var solvedAcIndicator2 = document.createElement("span")
            solvedAcIndicator2.innerText = " — "
            problemInfo.appendChild(solvedAcIndicator2)
            var contributeIndicator = document.createElement("a")
            contributeIndicator.href = "https://solved.ac/contribute/" + problemId
            contributeIndicator.innerText = "난이도 투표하러 가기"
            problemInfo.appendChild(contributeIndicator)
        }
    }

    if (isNotUserOrVsPage()) {
        pattern = /^(https?:\/\/(www\.)?acmicpc\.net)?\/problem\/([0-9]+)$/i
        var problemIds = []
        var problemLinks = document.getElementsByTagName("a")
        problemLinks = [].slice.call(problemLinks, 0)
        problemLinks
            .filter((item) => {
                return item.getAttribute("href") && pattern.test(item.getAttribute("href"))
            })
            .forEach((item, index) => {
                const problemId = item.getAttribute("href").match(pattern)[3]
                problemIds.push(problemId)
            })

        const levelData = await (await fetch("https://api.solved.ac/v2/problems/lookup.json?ids=" + problemIds.join(","))).json()
        var problemData = []
        if (levelData.success) {
            levelData.result.problems.forEach((problem) => {
                problemData[problem.id] = problem
            })
            problemLinks
                .filter((item) => {
                    return item.getAttribute("href") && pattern.test(item.getAttribute("href"))
                })
                .forEach((item, index) => {
                    const problemId = item.getAttribute("href").match(pattern)[3]
                    item.insertAdjacentHTML('afterbegin', levelLabel(problemData[problemId].level, problemData[problemId].level_locked))
                })
        }
    }

    if (isUserPage()) {
        var userId = document.querySelector(".page-header h1").innerText.trim()
        var userStaticsTable = document.querySelector("#statics tbody")
        const isShowUserTempTier = JSON.parse(await getPrefs('show_userpage_temp_tier', 'false'))
        const userData = await (await fetch("https://api.solved.ac/v2/users/show.json?id=" + userId)).json()

        if ((!userData.success || !userData.result.user.length) && !isShowUserTempTier) return
        const user = userData.result.user[0]

        var newRow = document.createElement("tr")
        var newRowHeader = document.createElement("th")
        var newRowDescription = document.createElement("td")

        newRowHeader.innerText = "solved.ac"
        newRowDescription.innerHTML = "<a href=\"https://solved.ac/" + user.user_id + "\">"
            + "<span class=\"text-" + levelCssClass(user.level) + "\">"
            + levelLabel(user.level) + "<b>" + user.user_id + "</b>"
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