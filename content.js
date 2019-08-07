function getData(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            callback(request.responseText);
        }
    };
    request.send();
}

function getJson(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            callback(data);
        }
    };
    request.send();
}

function getDom(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var el = document.createElement('html');
            el.innerHTML = request.responseText;
            callback(el);
        } else {
            // TODO
        }
    };
    request.onerror = function () {
        // TODO
    };
    request.send();
}

function initializeVoting(token, problemId, votedFlag) {
    var params = {
        "token": token
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.solved.ac/validate_token.php', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = function () {
        if (this.status == 200) {
            var response = JSON.parse(this.responseText);
            if (response.success) {
                var user = response.user;
                if (user.level >= 16) {
                    if (document.querySelector(".label-success")) {
                        const bottom = document.querySelector(".col-md-12:nth-child(4)");
                        const toggleFunction = "var o=document.getElementById('problem_difficulty');if(o.className==='poll_shown'){o.className='poll_hidden';}else{o.className='poll_shown';}";
                        var visibleState = "poll_shown";
                        if (votedFlag == true) visibleState = "poll_hidden";
                        bottom.outerHTML += "<div class=\"col-md-12\"><section id=\"problem_difficulty\" class=\"" + visibleState + "\"><div class=\"headline\" onclick=\"" + toggleFunction + "\"><h2>난이도 투표 <small>펼치기/접기</small></h2></div></section></div>";
        
                        const difficultySection = document.getElementById("problem_difficulty");
                        for (var i = 1; i <= 30; i++) {
                            const func = "var params={'token':'"+token+"','id':"+problemId+",'level':"+i+"};" +
                                "var o=new XMLHttpRequest;" + 
                                "o.open('POST','https://api.solved.ac/vote_difficulty.php',!0)," +
                                "o.onload=function(){(o.status>=200&&o.status<400&&location.reload())||(alert(JSON.parse(o.responseText).error))}," +
                                "o.send(JSON.stringify(params))";
                            difficultySection.innerHTML += "<span onclick=\"" + func + "\">" + levelLabel(i) + "</a>";
                            if (i % 5 == 0) difficultySection.innerHTML += "<br>";
                        }
                        difficultySection.innerHTML += "<br>";
                    }
                }
            } 
        }
    };
    xhr.send(JSON.stringify(params));
}

function formatPercentage(x) {
    if (x > 100) {
        return "100.0";
    } else if (x > 20) {
        return x.toFixed(1);
    } else if (x > 2) {
        return x.toFixed(2);
    } else if (x > 0.2) {
        return x.toFixed(3);
    } else if (x > 0.02) {
        return x.toFixed(4);
    } else if (x > 0.002) {
        return x.toFixed(5);
    } else {
        return x.toFixed(6);
    }
}

function levelName(level) {
    const prefix = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'];
    const roman = ['I', 'II', 'III', 'IV', 'V'];

    return prefix[Math.floor((level - 1) / 5)] + ' '  + roman[4 - (level - 1) % 5];
}

function levelShortDisplayName(level) {
    const prefix = ['B', 'S', 'G', 'P', 'D', 'R'];
    const roman = ['I', 'II', 'III', 'IV', 'V'];

    return '<b>' + prefix[Math.floor((level - 1) / 5)] + '</b> '  + roman[4 - (level - 1) % 5];
}

function levelCssClass(level) {
    const prefix = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'ruby'];

    return prefix[Math.floor((level - 1) / 5)];
}

function levelText(level) {
    if (level == 0) return "<span>Unranked</span>";
    return "<span class=\"text-" + levelCssClass(level) + "\">" + levelName(level) + "</span>";
}

function kudekiLevelText(level) {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    return "<span class=\"text-kudeki\">Kudeki " + roman[level - 1] + "</span>";
}

function levelLabel(level) {
    if (level == -1) level = 0;
    return "<span class=\"level_hidden\">" + ('0' + level).slice(-2)
    + "</span><img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/" + level + ".svg") + "\">";
}

function kudekiLevelLabel(level) {
    return "<img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/ka" + level + ".svg") + "\">";
}

if (document.getElementById("problem-body") || document.getElementById("chart_div")) {
    const problemId = document.querySelector("ul.problem-menu li a").innerText.replace(/[^0-9.]/g, "");
    getJson("https://api.solved.ac/problem_level.php?id=" + problemId, function(levelData) {
        if (levelData.level == null) return;
        getJson("https://api.solved.ac/question_level_votes.php?id=" + problemId, function(difficultyVotes) {
            const nick = document.querySelector("ul.loginbar li:first-child a").innerText.trim();
            var votedFlag = false;

            const problemInfo = document.querySelector("div.page-header");

            var titleBadge = document.createElement("span");
            titleBadge.className = "title_badge";
            titleBadge.innerHTML = levelLabel(levelData.level) + " " + levelText(levelData.level);
            problemInfo.appendChild(titleBadge);

            if (levelData.kudeki_level) {
                var titleBadge = document.createElement("span");
                titleBadge.className = "title_badge";
                titleBadge.innerHTML = " / " + kudekiLevelLabel(levelData.kudeki_level) + " " + kudekiLevelText(levelData.kudeki_level);
                problemInfo.appendChild(titleBadge);
            }

            if (levelData.level != 0) {
                problemInfo.appendChild(document.createElement("br"));
                problemInfo.appendChild(document.createElement("br"));
                var difficultyVotesHeader = document.createElement("b");
                difficultyVotesHeader.innerText = "난이도 의견";
                problemInfo.appendChild(difficultyVotesHeader);
                problemInfo.appendChild(document.createElement("br"));

                for (var i = 0; i < difficultyVotes.length; i++) {
                    var vote = difficultyVotes[i];
                    if (vote.user_id === nick) votedFlag = true;

                    var difficultyVote = document.createElement("span");
                    difficultyVote.className = "difficulty_vote";
                    difficultyVote.innerHTML = "<span class=\"text-" + levelCssClass(vote.user_level) + "\">" + levelLabel(vote.user_level) + vote.user_id + "</span> ➔ " + levelLabel(vote.voted_level);
                    problemInfo.appendChild(difficultyVote);
                }
            }

            chrome.storage.local.get('token', function(items) {
                initializeVoting(items.token, problemId, votedFlag);
            });
        });
    });
} else {
    var pattern = /^[/]problem[/][0-9]+$/i
    var problemLinks = document.getElementsByTagName("a");
    problemLinks = [].slice.call(problemLinks, 0);
    problemLinks
        .filter(function (item) {
            return item.getAttribute("href") && pattern.test(item.getAttribute("href"))
        })
        .forEach(function (item, index) {
            const problemId = item.getAttribute("href").split("/")[2];
    
            getJson("https://api.solved.ac/problem_level.php?id=" + problemId, function(levelData) {
                if (levelData.kudeki_level) {
                    item.insertAdjacentHTML('afterbegin', kudekiLevelLabel(levelData.kudeki_level));
                }
                item.insertAdjacentHTML('afterbegin', levelLabel(levelData.level));
            });
        })
}

$('.dropdown-toggle').dropdown();