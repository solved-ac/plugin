chrome.storage.local.get(['token'], ({ token }) => {
	debugger
	if (token) window.location.href = '/options_logged_info.html'
})

const submitButton = document.getElementById('submit')
const userIdInput = document.getElementById('user_id')
const passwordInput = document.getElementById('password')

const validate = () => {
	const { value: user_id } = userIdInput
	const { value: password } = passwordInput
	const params = { user_id, password }
	const xhr = new XMLHttpRequest()
	xhr.open('POST', 'https://api.solved.ac/request_token.php', true)
	xhr.setRequestHeader('Content-type', 'application/json')
	xhr.onload = ({ responseText, status }) => {
		console.log(responseText)
		if (!status === 200) {
			alert(JSON.parse(this.responseText).error)
			return
		}

		chrome.storage.local.set({ token: JSON.parse(responseText).token }, () => {
			chrome.tabs.getSelected(null, tab => {
				const code = 'window.location.reload();'
				chrome.tabs.executeScript(tab.id, { code })
			})
			window.location.href = '/options_logged_info.html'
		})
		return
	}
	xhr.send(JSON.stringify(params))
}

const onKeyPress = ({ keyCode }) => (keyCode === 13 ? validate() : null)

submitButton.addEventListener('click', validate)
userIdInput.addEventListener('keyup', onKeyPress)
passwordInput.addEventListener('keyup', onKeyPress)
