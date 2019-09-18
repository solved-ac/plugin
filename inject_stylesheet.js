const inject = localCss => {
	const href = chrome.extension.getURL(`css/${localCss}`)
	console.log(href)
	const injection = document.createElement('link')
	Object.assign(injection, {
		rel: 'stylesheet',
		type: 'text/css',
		href,
	})
	document.getElementsByTagName('head')[0].appendChild(injection)
}

const url = window.location.href
if (url.includes('acmicpc.net')) {
	inject('override-commons.css')
	inject('tagify.css')
}