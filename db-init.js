"use strict";
let usernames = ["Guled", "Chris", "Phil"];
let users = [];
let tasks = [
    { username: "Guled", name: "Finish Task Manager Demo", datetime: "2022-06-14T14:00" },
    { username: "Chris", name: "Anaylze Task Manager Demo Code", datetime: "2022-06-14T14:30" },
    { username: "Phil", name: "Critique Task Manager Demo", datetime: "2022-06-14T14:30" }
];
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
                }
            });
        });
    });
});
