const loggedInUser = document.getElementById('user_id')
const logoutButton = document.getElementById('submit')

const logout = () => {
	chrome.storage.local.remove('token', () => {
		chrome.tabs.getSelected(null, ({ id }) => {
			const code = 'window.location.reload();'
			chrome.tabs.executeScript(id, { code })
		})
		window.location.href = '/options_login.html'
	})
}

const validateToken = token => {
	const params = { token }
	const xhr = new XMLHttpRequest()
	xhr.open('POST', 'https://api.solved.ac/validate_token.php', true)
	xhr.setRequestHeader('Content-type', 'application/json')
	xhr.onload = ({ responseText }) => {
		console.log(responseText)
		if (!this.status === 200) {
			alert(JSON.parse(responseText).error)
			logout()
			return
		}
		const { user } = JSON.parse(responseText)
		loggedInUser.innerText = user.user_id
	}
	xhr.send(JSON.stringify(params))
}

chrome.storage.local.get(['token'], ({ token }) => {
	debugger
	if (token) {
		validateToken(token)
	}
})

logoutButton.addEventListener('click', logout)
