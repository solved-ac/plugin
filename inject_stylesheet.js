var url = window.location.href;
if (
    url.includes("acmicpc.net")
) inject("override-commons.css");

function inject(localCss) {
    console.log(chrome.extension.getURL("css/" + localCss));
    var injection = document.createElement("link");
    injection.setAttribute("rel", "stylesheet");
    injection.setAttribute("type", "text/css");
    injection.setAttribute("href", chrome.extension.getURL("css/" + localCss));
    document.getElementsByTagName("head")[0].appendChild(injection);
}