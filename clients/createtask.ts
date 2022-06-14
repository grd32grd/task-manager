//HTML Variables
let taskName: any = document.getElementById('createtaskname');
let taskDate: any = document.getElementById('createtaskdate');
let createTask: any = document.getElementById('createtask');

//Main Methods

//Function that'll clear the input fields
function resetTaskInput(){
    taskName.value = "";
    taskDate.value = "";  
}

//Function that'll create a task for the user who is logged in
createTask.onclick = () => {
    let newTask:Task = {
        name: "",
        datetime: ""
    };
    newTask.name = taskName.value;
    newTask.datetime = taskDate.value;

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("New task has been created.");
            resetTaskInput();
        }
    }
    
    x.open("PUT", "http://localhost:3000/createtask");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(newTask));
    
}