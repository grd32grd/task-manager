"use strict";
//HTML Variables
let subTaskName = document.getElementById('createsubtaskname');
let subTaskDate = document.getElementById('createsubtaskdate');
let createSubTask = document.getElementById('createsubtask');
let etaskName = document.getElementById('etaskname');
let etaskDate = document.getElementById('etaskdate');
let editTask = document.getElementById('edittask');
let comment = document.getElementById('comment');
let addComment = document.getElementById('addcomment');
//Main Methods
//Function that'll clear the input fields
function resetInput() {
    subTaskName.value = "";
    subTaskDate.value = "";
    etaskName.value = "";
    etaskDate.value = "";
    comment.value = "";
}
//Function that'll create a task for the user who is logged in
createSubTask.onclick = () => {
    var _a;
    let newSubTask = {
        name: "",
        datetime: "",
        priority: "medium"
    };
    newSubTask.name = subTaskName.value;
    newSubTask.datetime = subTaskDate.value;
    let x = new XMLHttpRequest();
    x.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("New sub task has been created.");
            resetInput();
            window.location.assign("/tasks");
        }
        else if (this.readyState == 4 && this.status == 404) {
            alert("This date has already passed!");
            resetInput();
        }
    };
    x.open("PUT", "/createsubtask");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify({
        subtask: newSubTask,
        parenttask: (_a = document.getElementById('taskname')) === null || _a === void 0 ? void 0 : _a.innerHTML
    }));
};
//Function that'll let you edit a task
editTask.onclick = () => {
    var _a, _b, _c, _d, _e, _f;
    let newTaskName = etaskName.value;
    let newTaskDate = etaskDate.value;
    let newComments = [];
    if (newTaskName != ((_a = document.getElementById('taskname')) === null || _a === void 0 ? void 0 : _a.innerHTML)) {
        newComments.push("Changed Task Name from: " + ((_b = document.getElementById('taskname')) === null || _b === void 0 ? void 0 : _b.innerHTML) + " to " + newTaskName);
    }
    if (newTaskDate != ((_c = document.getElementById('taskdate')) === null || _c === void 0 ? void 0 : _c.innerHTML)) {
        newComments.push("Changed Task Date from: " + ((_d = document.getElementById('taskdate')) === null || _d === void 0 ? void 0 : _d.innerHTML) + " to " + newTaskDate);
    }
    let y = new XMLHttpRequest();
    y.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Task info has been edited.");
            resetInput();
            window.location.assign("/tasks");
        }
    };
    y.open("POST", "/edittask");
    y.setRequestHeader("Content-Type", "application/json");
    y.send(JSON.stringify({
        oldname: (_e = document.getElementById('taskname')) === null || _e === void 0 ? void 0 : _e.innerHTML,
        olddate: (_f = document.getElementById('taskdate')) === null || _f === void 0 ? void 0 : _f.innerHTML,
        newname: newTaskName,
        newdate: newTaskDate,
        comments: newComments
    }));
};
addComment.onclick = () => {
    var _a;
    let z = new XMLHttpRequest();
    z.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Comment has been added.");
            resetInput();
            window.location.assign("/tasks");
        }
        else {
            console.log(this.readyState + this.status);
        }
    };
    z.open("POST", "/addcomment");
    z.setRequestHeader("Content-Type", "application/json");
    z.send(JSON.stringify({
        name: (_a = document.getElementById('taskname')) === null || _a === void 0 ? void 0 : _a.innerHTML,
        comment: comment.value
    }));
};
