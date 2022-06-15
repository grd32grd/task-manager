let taskSearch: any = document.getElementById('tasksearch');
taskSearch.value = "Demo";

taskSearch.oninput = () => {
    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

        }
    }
    x.open("GET", "http://localhost:3000/tasks/" + taskSearch.value);
    x.setRequestHeader("Content-Type", "application/json");
};