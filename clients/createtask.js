"use strict";
//HTML Variables
let taskName = document.getElementById('createtaskname');
let taskDate = document.getElementById('createtaskdate');
let createTask = document.getElementById('createtask');
let taskRemoveButtons = document.getElementsByClassName("taskremove");
let assignedUser = document.getElementById('userselect');
//Main Methods
//Function that'll clear the input fields
function resetTaskInput() {
    taskName.value = "";
    taskDate.value = "";
}
//Function that'll create a task for the user who is logged in
createTask.onclick = () => {
    let newTaskPriority;
    let low = document.getElementById('low');
    let medium = document.getElementById('medium');
    let high = document.getElementById('high');
    if (low.checked) {
        newTaskPriority = 'low';
    }
    else if (medium.checked) {
        newTaskPriority = 'medium';
    }
    else {
        newTaskPriority = 'high';
    }
    let newTask = {
        username: assignedUser.value,
        name: taskName.value,
        datetime: taskDate.value,
        priority: newTaskPriority
    };
    let privacy = document.getElementById('private');
    newTask.privacy = privacy.checked;
    let x = new XMLHttpRequest();
    x.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("New task has been created.");
            resetTaskInput();
            window.location.assign("http://localhost:3000/tasks");
        }
        else if (this.readyState == 4 && this.status == 404) {
            alert("This date has already passed!");
            resetTaskInput();
        }
    };
    x.open("PUT", "http://localhost:3000/createtask");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(newTask));
};
