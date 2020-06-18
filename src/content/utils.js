function loadScript(src) {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    s.onload = function() {
        this.remove();
    };
    
    (document.head || document.documentElement).appendChild(s);
}

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

function levelText(level, level_locked) {
    if (!level && level_locked) return "<span>Not ratable</span>"
    if (!level) return "<span>Unrated</span>"
    return "<span class=\"text-" + levelCssClass(level) + "\">" + levelName(level) + "</span>"
}

function levelLabelUnlisted() {
    return "<span class=\"level_hidden\">00"
    + "</span><img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/unlisted.svg") + "\">"
}

function levelLabel(level, level_locked) {
    if (level === null) return levelLabelUnlisted()
    if (level == -1) level = 0
    if (!level && level_locked) return "<span class=\"level_hidden\">00</span>" + "<img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/nr.svg") + "\">"
    return "<span class=\"level_hidden\">" + ('0' + level).slice(-2)
    + "</span><img class=\"level_badge small\" style=\"width: 1.1em;height: 1.4em;\" src=\"" + chrome.extension.getURL("svg/" + level + ".svg") + "\">"
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

function getExpectLevelFromExpPoint(exp, expTable) {
    for(i=0; i < expTable.length - 1; i++) {
        if(expTable[i] < exp && exp < expTable[i + 1])
            return i + 1;
    }
    if(exp>expTable[expTable.length - 1])
        return expTable.length
}