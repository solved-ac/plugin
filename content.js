function getData(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            callback(request.responseText);
        } else {
            // TODO
        }
    };
    request.onerror = function () {
        // TODO
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
        } else {
            // TODO
        }
    };
    request.onerror = function () {
        // TODO
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
    const prefix = ['b', 's', 'g', 'p', 'd', 'r'];

    return prefix[Math.floor((level - 1) / 5)] + (5 - (level - 1) % 5);
}

function levelText(level) {
    if (level == 0) return "<span>Unranked</span>";
    return "<span class=\"text-" + levelCssClass(level) + "\">" + levelName(level) + "</span>";
}

function levelLabel(level) {
    if (level == -1) level = 0;
    return "<span class=\"level_hidden\">" + ('0' + level).slice(-2)
    + "</span><img class=\"level_badge small\" src=\"//solved.ac/res/tier-small/" + level + ".svg\">";
}

if (document.getElementById("problem-body") || document.getElementById("chart_div")) {
    const problemId = document.querySelector("ul.problem-menu li a").innerText.replace(/[^0-9.]/g, "");
    getData("https://api.solved.ac/question_level.php?id=" + problemId, function(level) {
        getJson("https://api.solved.ac/question_level_votes.php?id=" + problemId, function(difficultyVotes) {
            const nick = document.querySelector("ul.loginbar li:first-child a").innerText.trim();
            var votedFlag = false;

            const problemInfo = document.querySelector("div.page-header");
            problemInfo.innerHTML = problemInfo.innerHTML + "<span class=\"title_badge\">" + levelLabel(level) + " " + levelText(level) + "</span>";
            if (level != 0) {
                problemInfo.innerHTML = problemInfo.innerHTML + "<br><br><b>난이도 의견</b><br>";

                    for (var i = 0; i < difficultyVotes.length; i++) {
                        var vote = difficultyVotes[i];
                        if (vote.user_id === nick) votedFlag = true;
                        problemInfo.innerHTML = problemInfo.innerHTML + "<span class=\"difficulty_vote\"><span class=\"text-" + levelCssClass(vote.user_level) + "\">" + levelLabel(vote.user_level) + vote.user_id + "</span> ➔ " + levelLabel(vote.voted_level) + "</span>";
                    }
                
            }
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
    
            getData("https://api.solved.ac/question_level.php?id=" + problemId, function(level) {
                const originalHTML = item.outerHTML;
                item.outerHTML = levelLabel(level) + ' ' + originalHTML;
            });
        })
}

$('.dropdown-toggle').dropdown();