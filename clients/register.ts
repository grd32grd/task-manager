//HTML Variables
let usernameInput: any = document.getElementById('username');
let passwordInput: any = document.getElementById('password');
let register: any = document.getElementById('register');

//Main Methods
function reset(){
    usernameInput.value = "";
    passwordInput.value = "";  
}

//Function that'll send put request for the purpose of registering in the user
register.onclick = () =>{
    let newUser = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(newUser.username + " has been added as a user.");
            reset();
            window.location.assign("/tasks");

        //Error message sent from server
        } else if (this.readyState == 4 && this.status == 404) {
            alert(JSON.parse(x.responseText));
        }
    }
    
    x.open("PUT", "/register");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(newUser));
}