//HTML Variables
let subTaskName: any = document.getElementById('createsubtaskname');
let subTaskDate: any = document.getElementById('createsubtaskdate');
let createSubTask: any = document.getElementById('createsubtask');
let etaskName: any = document.getElementById('etaskname');
let etaskDate: any = document.getElementById('etaskdate');
let editTask: any = document.getElementById('edittask');

//Main Methods

//Function that'll clear the input fields
function resetInput(){
    subTaskName.value = "";
    subTaskDate.value = ""; 
    etaskName.value = "";
    etaskDate.value = ""; 
}

//Function that'll create a task for the user who is logged in
createSubTask.onclick = () => {
    let newSubTask:Task = {
        name: "",
        datetime: "",
        priority: "medium"
    };
    newSubTask.name = subTaskName.value;
    newSubTask.datetime = subTaskDate.value;

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("New sub task has been created.");
            resetInput();
            window.location.assign("http://localhost:3000/tasks");
        }
        else if (this.readyState == 4 && this.status == 404){
            alert("This date has already passed!")
            resetInput();
        }
    }
    
    x.open("PUT", "http://localhost:3000/createsubtask");
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
        newComments.push("Changed Task Name from: " + document.getElementById('taskname')?.innerHTML)
    }
    if (newTaskDate != document.getElementById('taskdate')?.innerHTML){
        newComments.push("Changed Task Date from: " + document.getElementById('taskdate')?.innerHTML)
    }

    
    let y = new XMLHttpRequest();
    y.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Task info has been edited.");
            resetInput();
            window.location.assign("http://localhost:3000/tasks");
        }
    }
    
    y.open("POST", "http://localhost:3000/edittask");
    y.setRequestHeader("Content-Type", "application/json");    
    y.send(JSON.stringify({
        oldname: document.getElementById('taskname')?.innerHTML,
        olddate: document.getElementById('taskdate')?.innerHTML,
        newname: newTaskName,
        newdate: newTaskDate,
        comments: newComments
    }))  
}