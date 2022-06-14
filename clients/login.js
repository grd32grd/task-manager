"use strict";
//HTML Variables
let loginUsernameInput = document.getElementById('loginusername');
let loginPasswordInput = document.getElementById('loginpassword');
let login = document.getElementById('login');
//Main Methods
//Function that'll clear the input fields
function resetLoginInput() {
    loginUsernameInput.value = "";
    loginPasswordInput.value = "";
}
//Function that'll send put request for the purpose of logging in the user
login.onclick = () => {
    let user = {
        username: "",
        password: "",
    };
    user.username = loginUsernameInput.value;
    user.password = loginPasswordInput.value;
    let x = new XMLHttpRequest();
    x.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert(user.username + " has been logged in");
            resetLoginInput();
            let id = (JSON.parse(x.responseText));
            window.location.assign("http://localhost:3000/users/" + id);
        }
    };
    x.open("PUT", "http://localhost:3000/login");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(user));
};
