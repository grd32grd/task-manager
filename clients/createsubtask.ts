//HTML Variables
let subTaskName: any = document.getElementById('createsubtaskname');
let subTaskDate: any = document.getElementById('createsubtaskdate');
let createSubTask: any = document.getElementById('createsubtask');

//Main Methods

//Function that'll clear the input fields
function resetSubTaskInput(){
    subTaskName.value = "";
    subTaskDate.value = "";  
}

//Function that'll create a task for the user who is logged in
createSubTask.onclick = () => {
    let newSubTask:Task = {
        name: "",
        datetime: ""
    };
    newSubTask.name = subTaskName.value;
    newSubTask.datetime = subTaskDate.value;

    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("New sub task has been created.");
            resetSubTaskInput();
            window.location.assign("http://localhost:3000/tasks");
        }
        else if (this.readyState == 4 && this.status == 404){
            alert("This date has already passed!")
            resetSubTaskInput();
        }
    }
    
    x.open("PUT", "http://localhost:3000/createsubtask");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify({
        subtask: newSubTask,
        parenttask: document.getElementById('taskname')?.innerHTML
    }));
    
}