//HTML Variables
let taskName: any = document.getElementById('createtaskname');
let taskDate: any = document.getElementById('createtaskdate');
let createTask: any = document.getElementById('createtask');
let taskRemoveButtons: any = document.getElementsByClassName("taskremove")
let assignedUser: any = document.getElementById('userselect')

//Main Methods

//Function that'll clear the input fields
function resetTaskInput(){
    taskName.value = "";
    taskDate.value = "";  
}

//Function that'll create a task for the user who is logged in
createTask.onclick = () => {
    let newTaskPriority: string;
    let low: any = document.getElementById('low');
    let medium: any = document.getElementById('medium');
    let high: any = document.getElementById('high');

    if (low.checked){
        newTaskPriority = 'low';
    } else if (medium.checked){
        newTaskPriority = 'medium';
    } else{
        newTaskPriority = 'high'
    } 

    let newTask:Task = {
        username: assignedUser.value,
        name: taskName.value,
        datetime: taskDate.value,
        priority: newTaskPriority,
        status: 'Created'
    };

    let privacy: any = document.getElementById('private');
    newTask.privacy = privacy.checked;

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("New task has been created.");
            resetTaskInput();
            window.location.assign("/tasks");
        }
        else if (this.readyState == 4 && this.status == 404){
            alert("This date has already passed!")
            resetTaskInput();
        }
    }
    x.open("PUT", "/createtask");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(newTask));
}