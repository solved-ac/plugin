var loggedInUser = document.getElementById('user_id');
var logoutButton = document.getElementById('submit');

function logout() {
    chrome.storage.local.remove("token", function() {
        chrome.tabs.getSelected(null, function(tab) {
            var code = 'window.location.reload();';
            chrome.tabs.executeScript(tab.id, {code: code});
        });
        window.location.href = '/options_login.html';
    });
}

function validateToken(token) {
    var params = {
        "token": token
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.solved.ac/validate_token.php', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = function () {
        console.log(this.responseText);
        if (this.status == 200) {
            var response = JSON.parse(this.responseText);
            loggedInUser.innerText = response.user.user_id;
        } else {
            alert(JSON.parse(this.responseText).error);
            logout();
        }
    };
    xhr.send(JSON.stringify(params));
}

chrome.storage.local.get(["token"], function(items){
    debugger;
    if (items.token) {
        validateToken(items.token);
    }
});

logoutButton.addEventListener("click", logout);