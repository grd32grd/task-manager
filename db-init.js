"use strict";
let tasks = [
    { username: "Guled", name: "Finish Task Manager Demo", datetime: "2022-07-14T14:00", datetimeformat: "July 14 2022 @ 14:00", priority: "High", status: "Active" },
    { username: "Chris", name: "Anaylze Task Manager Demo Code", datetime: "2022-07-14T14:30", datetimeformat: "July 14 2022 @ 14:30", priority: "Medium", status: "Created" },
    { username: "Phil", name: "Critique Task Manager Demo", datetime: "2022-07-14T14:30", datetimeformat: "July 14 2022 @ 14:30", priority: "Medium", status: "Created" }
];
let glossaryentries = [
    { acronym: 'PaaS', name: 'Platform as a Service', definition: 'A cloud computing model where a third-party provider delivers hardware and software tools to users over the internet.' },
    { acronym: 'DMZ', name: 'Demilitarized Zone', definition: 'A part of the network that is located between any two policy-enforcing components of the network and that enables an organization to host its own Internet services.' },
    { acronym: 'AG', name: 'Access Governance', definition: 'An aspect of information technology security management that seeks to reduce the risks associated with end users who have unnecessary access privileges.' },
    { acronym: 'IBS', name: 'Internal Boundary System', definition: 'A gateway that connects two or more Internetworks within a Network Security Zone.' },
    { acronym: 'DOM', name: 'Document Object Model', definition: 'A programming interface specification that lets a programmer create and modify HTML pages and XML documents as program elements.' }
];
let usernames = ["Guled", "Chris", "Phil"];
let users = [];
usernames.forEach(name => {
    let u = {
        username: name,
        password: name,
    };
    users.push(u);
});
//MongoDB Setup
let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let db;
MongoClient.connect("mongodb://localhost:27017/", function (err, client) {
    if (err)
        throw err;
    db = client.db("taskmanager");
    db.listCollections().toArray(function (err, result) {
        if (result.length == 0) {
            db.collection("users").insertMany(users, function (err, result) {
                if (err) {
                    throw err;
                }
                console.log(result.insertedCount + " initial users were added (should be 3).");
                client.close();
            });
            db.collection("tasks").insertMany(tasks, function (err, result) {
                if (err) {
                    throw err;
                }
                console.log(result.insertedCount + " initial tasks were added (should be 3).");
                client.close();
            });
            db.collection("glossaryentries").insertMany(glossaryentries, function (err, result) {
                if (err) {
                    throw err;
                }
                console.log(result.insertedCount + " initial glossary entries were added (should be 5).");
                client.close();
            });
            return;
        }
        let numDropped = 0;
        let toDrop = result.length;
        result.forEach((collection) => {
            db.collection(collection.name).drop(function (err, delOK) {
                if (err) {
                    throw err;
                }
                console.log("Dropped collection: " + collection.name);
                numDropped++;
                if (numDropped == toDrop) {
                    db.collection("users").insertMany(users, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        console.log(result.insertedCount + " initial users were added (should be 3).");
                        client.close();
                    });
                    db.collection("tasks").insertMany(tasks, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        console.log(result.insertedCount + " initial tasks were added (should be 3).");
                        client.close();
                    });
                    db.collection("glossaryentries").insertMany(glossaryentries, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        console.log(result.insertedCount + " initial glossary entries were added (should be 5).");
                        client.close();
                    });
                }
            });
        });
    });
});
