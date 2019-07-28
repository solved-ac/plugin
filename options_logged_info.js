const loggedInUser = document.getElementById('user_id')
const logoutButton = document.getElementById('submit')
const URL = 'https://api.solved.ac/validate_token.php'

const logout = () => {
	chrome.storage.local.remove('token', () => {
		chrome.tabs.getSelected(null, ({ id }) => {
			const code = 'window.location.reload();'
			chrome.tabs.executeScript(id, { code })
		})
		window.location.href = '/options_login.html'
	})
}

const validateToken = ({ token }) => {
	debugger
	axios.post(URL, { token }).then(({ data, status }) => {
		loggedInUser.innerText = data.user.user_id
	})
}

chrome.storage.local.get(['token'], validateToken)

logoutButton.addEventListener('click', logout)
