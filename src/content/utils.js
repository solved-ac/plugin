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

function getExpPointFromLevel(level){
    const levelData = [320, 480, 912, 1642, 2791, 4465, 6698, 9913, 14472, 20840, 29593, 
                       41431, 57588, 79472, 108877, 148072, 200638, 270862, 364309, 488174, 
                       651712, 866777, 1148479, 1515993, 1993531, 2611525, 3408040, 4430452,
                       5737436, 7401292, 9510661]
    return levelData[level]
}

function getExpectLevelFromExpPoint(exp){
    const expTable = [0, 4800, 15740, 38720, 83400, 163700, 298000, 785400, 1202800, 1795000, 2834700,
                      4276000, 6261000, 8982000, 12704000, 18796000, 26842000, 37941000, 52792000, 
                      720000000, 152000000, 213000000, 294000000, 380000000, 639000000, 1000000000, 
                      1200000000, 1500000000]
    for(i=0;i<expTable.length-1;i++){
        if(expTable[i] < exp && exp < expTable[i+1])
            return i+1;
    }
    if(exp>expTable[expTable.length-1])
        return expTable.length
}