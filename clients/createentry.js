"use strict";
//HTML Variables
let entryName = document.getElementById('createentryname');
let entryAcronym = document.getElementById('createentryacronym');
let entryDef = document.getElementById('createentrydef');
let createEntry = document.getElementById('createentry');
//Main Methods
//Function that'll clear the input fields
function resetEntryInput() {
    entryName.value = "";
    entryAcronym.value = "";
    entryDef.value = "";
}
//Function that'll create an entry and add it to the glossary.
createEntry.onclick = () => {
    let newEntry = {
        name: entryName.value,
        acronym: entryAcronym.value,
        definition: entryDef.value
    };
    let x = new XMLHttpRequest();
    x.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("New glossary entry has been created.");
            resetEntryInput();
            window.location.assign("/glossary");
        }
    };
    x.open("PUT", "/createentry");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(newEntry));
};
