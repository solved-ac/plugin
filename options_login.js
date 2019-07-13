chrome.storage.local.get(["token"], function(items){
    debugger;
    if (items.token) {
        window.location.href = '/options_logged_info.html';
    }
});

var submitButton = document.getElementById('submit');

var userIdInput = document.getElementById('user_id');
var passwordInput = document.getElementById('password');

function onKeyPress() {
    if (event.keyCode == 13) {
        validate();
    }
}

function validate() {
    var userId = userIdInput.value;
    var password = passwordInput.value;
    var params = {
        "user_id": userId,
        "password": password
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.solved.ac/request_token.php', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onload = function () {
        console.log(this.responseText);
        if (this.status == 200) {
            chrome.storage.local.set({ "token" : JSON.parse(this.responseText).token }, function() {
                chrome.tabs.getSelected(null, function(tab) {
                    var code = 'window.location.reload();';
                    chrome.tabs.executeScript(tab.id, {code: code});
                });
                window.location.href = '/options_logged_info.html';
            });
        } else {
            alert(JSON.parse(this.responseText).error);
        }
    };
    xhr.send(JSON.stringify(params));
}

submitButton.addEventListener("click", validate);
userIdInput.addEventListener("keyup", onKeyPress);
passwordInput.addEventListener("keyup", onKeyPress);