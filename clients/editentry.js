"use strict";
let editEntryAcronym = document.getElementById('editentryacronym');
let editEntryDef = document.getElementById('editentrydef');
let editEntry = document.getElementById('editentry');
//Main Methods
//Function that'll create an entry and add it to the glossary.
editEntry.onclick = () => {
    var _a;
    let x = new XMLHttpRequest();
    x.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            alert("Glossary entry has been created.");
            window.location.assign("http://localhost:3000/glossary");
        }
    };
    x.open("POST", "http://localhost:3000/editentry");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify({
        name: (_a = document.getElementById('gname')) === null || _a === void 0 ? void 0 : _a.innerHTML,
        acronym: editEntryAcronym.value,
        definition: editEntryDef.value
    }));
};
