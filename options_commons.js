function getPrefs(key, after) {
    chrome.storage.local.get([key], (value) => { after(value[key]) })
}

function setPrefs(key, value) {
    var params = {}
    params[key] = value
    chrome.storage.local.set(params)
}

var optionItems = document.querySelectorAll('.option_item')
optionItems.forEach(
    (optionItem) => {
        var key = optionItem.dataset.key
        var toggler = optionItem.querySelector('.option_switch')
        getPrefs(key, (value) => {
            if (value === undefined) return;
            if (JSON.parse(value) === true) {
                toggler.classList.add('active')
            }
        })
        toggler.onclick = () => {
            if (toggler.classList.contains('active')) {
                setPrefs(key, 'false')
                toggler.classList.remove('active')
            } else {
                setPrefs(key, 'true')
                toggler.classList.add('active')
            }
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, ({ id }) => {
                const code = 'window.location.reload();'
                chrome.tabs.executeScript(id, { code })
            })
        }
    }
)