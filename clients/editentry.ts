let editEntryAcronym: any = document.getElementById('editentryacronym');
let editEntryDef: any = document.getElementById('editentrydef');
let editEntry: any = document.getElementById('editentry');

//Main Methods

//Function that'll create an entry and add it to the glossary.
editEntry.onclick = () => {
    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Glossary entry has been created.");
            window.location.assign("http://localhost:3000/glossary");
        }
    }
    x.open("POST", "http://localhost:3000/editentry");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify({
        name: document.getElementById('gname')?.innerHTML,
        acronym: editEntryAcronym.value,
        definition: editEntryDef.value
    }));
}