
//HTML Variables
let loginUsernameInput:any = document.getElementById('loginusername');
let loginPasswordInput:any = document.getElementById('loginpassword');
let login:any = document.getElementById('login');

//Main Methods
function reset(){
    loginUsernameInput.value = "";
    loginPasswordInput.value = "";  
}

//Function that'll send put request for the purpose of logging in the user
login.onclick = () => {
    let user:User = {
        username: "",
        password: "",
        privacy: false
    };
    user.username = loginUsernameInput.value;
    user.password = loginPasswordInput.value;

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(user.username + " has been logged in");
            reset();
            let id = (JSON.parse(x.responseText));
            window.location.assign("http://localhost:3000/users/" + id);
        }
    }
    
    x.open("PUT", "http://localhost:3000/login");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(user));
}
