//HTML Variables
let subTaskName: any = document.getElementById('createsubtaskname');
let subTaskDate: any = document.getElementById('createsubtaskdate');
let createSubTask: any = document.getElementById('createsubtask');
let etaskName: any = document.getElementById('etaskname');
let etaskDate: any = document.getElementById('etaskdate');
let editTask: any = document.getElementById('edittask');
let comment: any = document.getElementById('comment');
let addComment: any = document.getElementById('addcomment');

//Main Methods

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
            window.location.assign("/tasks/card");
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
    let datearray: string[] = etaskDate.value.split(/[-:T]+/);
    let newTaskDate = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][parseInt(datearray[1])-1] + " " + datearray[2] + " " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4];
    
    let newComments: CommentType[] = [];

    if (newTaskName != document.getElementById('taskname')?.innerHTML){
        let nameChange: CommentType = {
            type: 'modification',
            comment: "Task's name changed from: " + document.getElementById('taskname')?.innerHTML + " to " + newTaskName + "."
        }
        newComments.push(nameChange);
    }
    if (newTaskDate != document.getElementById('taskdate')?.innerHTML){
        let dateChange: CommentType = {
            type: 'modification',
            comment: "Task's due date changed from: " + document.getElementById('taskdate')?.innerHTML + " to " + newTaskDate + "."
        }
        newComments.push(dateChange);
    }

    
    let y = new XMLHttpRequest();
    y.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Task info has been edited.");
            resetInput();
            window.location.assign("/tasks/card");
        }
    }
    
    y.open("POST", "/edittask");
    y.setRequestHeader("Content-Type", "application/json");    
    y.send(JSON.stringify({
        oldname: document.getElementById('taskname')?.innerHTML,
        olddate: document.getElementById('taskdate')?.innerHTML,
        newname: newTaskName,
        newdate: etaskDate.value,
        comments: newComments
    }))  
}

//Function that'll let you add a comment.
addComment.onclick = () => {
    let newComment: CommentType = {
        type: 'user-comment',
        comment: comment.value
    }
    let z = new XMLHttpRequest();
    z.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Comment has been added.");
            resetInput();
            window.location.assign("/tasks/card");
        }
    }
    
    z.open("POST", "/addcomment");
    z.setRequestHeader("Content-Type", "application/json");    
    z.send(JSON.stringify({
        name: document.getElementById('taskname')?.innerHTML,
        comment: newComment
    }))  
}