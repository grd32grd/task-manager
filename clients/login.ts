//HTML Variables
let loginUsernameInput:any = document.getElementById('loginusername');
let loginPasswordInput:any = document.getElementById('loginpassword');
let login:any = document.getElementById('login');

//Main Methods

//Function that'll clear the input fields
function resetLoginInput(){
    loginUsernameInput.value = "";
    loginPasswordInput.value = "";  
}

//Function that'll send put request for the purpose of logging in the user
login.onclick = () => {
    let user:User = {
        username: "",
        password: "",
    };
    user.username = loginUsernameInput.value;
    user.password = loginPasswordInput.value;

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(user.username + " has been logged in.");
            resetLoginInput();
            window.location.reload();
        } else if (this.readyState == 4 && this.status == 405){
            alert("Incorrect username or password.")
        }
    }
    
    x.open("PUT", "/login");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(user));
}
