//HTML Variables
let subTaskName: any = document.getElementById('createsubtaskname');
let subTaskDate: any = document.getElementById('createsubtaskdate');
let createSubTask: any = document.getElementById('createsubtask');
let etaskName: any = document.getElementById('etaskname');
let etaskDate: any = document.getElementById('etaskdate');
let editTask: any = document.getElementById('edittask');
let comment: any = document.getElementById('comment');
let addComment: any = document.getElementById('addcomment');
let startTask: any = document.getElementById('starttask');
let completeTask: any = document.getElementById('completetask');

//Main Methods

//Function that'll let you start a task and move it's category to active
startTask.onclick = () => {
    let a = new XMLHttpRequest();
    a.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Task has been started.");
            window.location.assign("/tasks/icon");
        }
    }
    a.open("POST", "/starttask");
    a.setRequestHeader("Content-Type", "application/json");    
    a.send(JSON.stringify({
        name: document.getElementById('taskname')?.innerHTML
    }))  
}

//Function that'll let you complete a task and move it's category to closed
completeTask.onclick = () => {
    let b = new XMLHttpRequest();
    b.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Task has been completed.");
            window.location.assign("/tasks/icon");
        }
    }
    b.open("POST", "/completetask");
    b.setRequestHeader("Content-Type", "application/json");    
    b.send(JSON.stringify({
        name: document.getElementById('taskname')?.innerHTML
    }))    
}

//Function that'll clear the input fields
function resetInput(){
    subTaskName.value = "";
    subTaskDate.value = ""; 
    etaskName.value = "";
    etaskDate.value = ""; 
    comment.value = "";
}

//Function that'll create a task for the user who is logged in
createSubTask.onclick = () => {
    let newSubTask:Task = {
        name: "",
        datetime: "",
        priority: "Medium",
        status: "Created"
    };
    newSubTask.name = subTaskName.value;
    newSubTask.datetime = subTaskDate.value;

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("New sub task has been created.");
            resetInput();
            window.location.assign("/tasks/icon");
        }
        else if (this.readyState == 4 && this.status == 404){
            alert("This date has already passed!")
            resetInput();
        }
    }
    
    x.open("PUT", "/createsubtask");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify({
        subtask: newSubTask,
        parenttask: document.getElementById('taskname')?.innerHTML
    }));   
}

//Function that'll let you edit a task
editTask.onclick = () => {
    let newTaskName = etaskName.value;
    let newTaskDate = etaskDate.value;
    let newComments: String[] = [];

    if (newTaskName != document.getElementById('taskname')?.innerHTML){
        newComments.push("Changed Task Name from: " + document.getElementById('taskname')?.innerHTML + " to " + newTaskName)
    }
    if (newTaskDate != document.getElementById('taskdate')?.innerHTML){
        newComments.push("Changed Task Date from: " + document.getElementById('taskdate')?.innerHTML + " to " + newTaskDate)
    }

    
    let y = new XMLHttpRequest();
    y.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Task info has been edited.");
            resetInput();
            window.location.assign("/tasks/icon");
        }
    }
    
    y.open("POST", "/edittask");
    y.setRequestHeader("Content-Type", "application/json");    
    y.send(JSON.stringify({
        oldname: document.getElementById('taskname')?.innerHTML,
        olddate: document.getElementById('taskdate')?.innerHTML,
        newname: newTaskName,
        newdate: newTaskDate,
        comments: newComments
    }))  
}

//Function that'll let you add a comment.
addComment.onclick = () => {
    let z = new XMLHttpRequest();
    z.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Comment has been added.");
            resetInput();
            window.location.assign("/tasks/icon");
        }
    }
    
    z.open("POST", "/addcomment");
    z.setRequestHeader("Content-Type", "application/json");    
    z.send(JSON.stringify({
        name: document.getElementById('taskname')?.innerHTML,
        comment: comment.value
    }))  
}