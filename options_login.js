chrome.storage.local.get(['token'], ({ token }) => {
	debugger
	if (token) window.location.href = '/options_logged_info.html'
})

const submitButton = document.getElementById('submit')
const userIdInput = document.getElementById('user_id')
const passwordInput = document.getElementById('password')
const URL = 'https://api.solved.ac/request_token.php'

const validate = () => {
	const { value: user_id } = userIdInput
	const { value: password } = passwordInput
	axios
		.post(URL, { user_id, password })
		.then(({ data, status }) => {
			const { token } = data
			console.log(token)
			chrome.storage.local.set({ token }, () => {
				chrome.tabs.query({
					active: true,
					currentWindow: true
				}, ({ id }) => {
					const code = 'window.location.reload();'
					chrome.tabs.executeScript(id, { code })
				})
				window.location.href = '/options_logged_info.html'
			})
		})
		.catch(({ message }) => alert(message))
}

const onKeyPress = ({ keyCode }) => (keyCode === 13 ? validate() : null)

submitButton.addEventListener('click', validate)
userIdInput.addEventListener('keyup', onKeyPress)
passwordInput.addEventListener('keyup', onKeyPress)
