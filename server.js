"use strict";
//Const Variables
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//Setup
const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBUsers = require('connect-mongodb-session')(session);
const mc = require('mongodb').MongoClient;
app.set('view engine', 'pug');
app.set('title', 'taskmanager');
let mongoStore = new MongoDBUsers({
    uri: 'mongodb://localhost:27017/taskmanager',
    collection: 'sessions'
});
mongoStore.on('error', (error) => { console.log(error); });
app.use(session({
    secret: 'some secret key here',
    resave: true,
    saveUninitialized: true,
    store: mongoStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // Equal to a week
    }
}));
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Server
mc.connect("mongodb://localhost:27017", function (err, client) {
    if (err) {
        console.log("Error in connecting to database.");
        console.log(err);
        return;
    }
    let users = client.db('taskmanager').collection('users');
    let tasks = client.db('taskmanager').collection('tasks');
    let glossaryentries = client.db('taskmanager').collection('glossaryentries');
    //Tasks Page - card View
    app.get('/', function (req, res) {
        if (req.session.loggedin != true) {
            req.session.loggedin = false;
            req.session.username = undefined;
            req.session.password = undefined;
            req.session._id = undefined;
            req.session.lightmode = true;
        }
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('tasks_card.pug', { tasks: docs, session: req.session });
        });
    });
    app.get('/tasks/card', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('tasks_card.pug', { tasks: docs, session: req.session });
        });
    });
    //Tasks Page - List View
    app.get('/tasks/list', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('tasks_list.pug', { tasks: docs, session: req.session });
        });
    });
    //Route to get to a full comments page.
    app.get('/comments', function (req, res) {
        res.render('comments.pug', { session: req.session });
    });
    //Glossary Page
    app.get('/glossary', function (req, res) {
        glossaryentries.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('glossary.pug', { session: req.session, glossaryentries: docs.sort((a, b) => (a.name > b.name) ? 1 : -1) });
        });
    });
    //Parameter used to search for specific glossary entries
    app.param('glossarysearch', function (req, res, next, value) {
        let searchedEntries = [];
        glossaryentries.find().toArray(function (err, docs) {
            if (err)
                throw err;
            docs.forEach((g) => {
                if (g.name.toUpperCase().includes(value.toUpperCase())) {
                    searchedEntries.push(g);
                }
            });
            res.searchedEntries = searchedEntries;
            next();
        });
    });
    app.get('/glossary/:glossarysearch', function (req, res) {
        res.render('glossary.pug', { glossaryentries: res.searchedEntries.sort((a, b) => (a.name > b.name) ? 1 : -1), session: req.session });
    });
    //Create Glossary Entry Page
    app.get('/createentry', function (req, res) {
        users.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('createentry.pug', { users: docs, session: req.session });
        });
    });
    app.post('/switchmode', function (req, res) {
        req.session.lightmode = !req.session.lightmode;
        res.render('frontpage.pug', { session: req.session });
    });
    //Register page
    app.get('/register', function (req, res) {
        res.render('register.pug', { session: req.session });
    });
    //Route to log a logged in user out.
    app.get('/logout', function (req, res) {
        req.session.loggedin = false;
        req.session.username = undefined;
        req.session.password = undefined;
        req.session._id = undefined;
        res.render('frontpage.pug', { session: req.session });
    });
    //Create Task Page
    app.get('/createtask', function (req, res) {
        users.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('createtask.pug', { users: docs, session: req.session });
        });
    });
    //Parameter used to search for specific tasks
    app.param('tasksearch', function (req, res, next, value) {
        let searchedTasks = [];
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            docs.forEach((t) => {
                if (t.name.toUpperCase().includes(value.toUpperCase())) {
                    searchedTasks.push(t);
                }
            });
            res.searchedTasks = searchedTasks;
            next();
        });
    });
    app.get('/tasks/card/:tasksearch', function (req, res) {
        res.render('tasks_card.pug', { tasks: res.searchedTasks, session: req.session });
    });
    app.get('/tasks/list/:tasksearch', function (req, res) {
        res.render('tasks_list.pug', { tasks: res.searchedTasks, session: req.session });
    });
    //Parameter used by a number of routes needing the id of a user's profile.
    app.param('profileid', function (req, res, next, value) {
        users.find().toArray(function (err, docs) {
            if (err)
                throw err;
            docs.forEach((u) => {
                if (u._id == value) {
                    res.userprofile = u;
                    next();
                }
            });
        });
    });
    //Parameter used to find the glossary entry corresponding with the name
    app.param('entryid', function (req, res, next, value) {
        glossaryentries.find().toArray(function (err, docs) {
            if (err)
                throw err;
            docs.forEach((g) => {
                if (g._id == value) {
                    res.glossaryentry = g;
                    next();
                }
            });
        });
    });
    //Route to get to a glossary entry's page to view it's content and modify it's info
    app.get('/glossaryentry/:entryid', function (req, res) {
        res.render('editentry.pug', { glossaryentry: res.glossaryentry, session: req.session });
    });
    //Route to get to a task's page to see detailed info as well as it's subtasks.
    app.get('/:taskid', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            //Iterates over the database to find the task with the given ID
            docs.forEach((t) => {
                if (t._id == req.params.taskid) {
                    res.render('createsubtask.pug', { task: t, session: req.session });
                }
            });
        });
    });
    //Route to get a user logged in
    app.put('/login', function (req, res) {
        users.find().toArray(function (err, docs) {
            if (err)
                throw err;
            docs.forEach((u) => {
                if (u.username == req.body.username && u.password == req.body.password) {
                    req.session.loggedin = true;
                    req.session.username = u.username;
                    req.session.password = u.password;
                    req.session._id = u._id;
                    res.status(200).send(JSON.stringify(u._id));
                }
            });
        });
    });
    //Route to add an glossary entry to the glossary.
    app.put('/createentry', function (req, res) {
        glossaryentries.insertOne({
            name: req.body.name,
            acronym: req.body.acronym,
            definition: req.body.definition
        });
        console.log(req.body.definition);
        console.log(req.body);
        res.sendStatus(200);
    });
    //Route to add newly created task and assign it to the logged in user.
    app.put('/createtask', function (req, res) {
        //Error checking to determine if date has already passed - only checks if year has passed for now.
        let date = req.body.datetime.split("-");
        if (parseInt(date[0]) < 2022) {
            res.status(404).send();
        }
        else {
            users.find().toArray(function (err, docs) {
                if (err)
                    throw err;
                docs.forEach((u) => {
                    if (u.username == req.session.username && u.password == req.session.password) {
                        let datearray = req.body.datetime.split(/[-:T]+/);
                        let datetimeformatted = monthNames[parseInt(datearray[1]) - 1] + " " + datearray[2] + " " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4];
                        tasks.insertOne({
                            username: req.body.username,
                            name: req.body.name,
                            datetime: req.body.datetime,
                            datetimeformat: datetimeformatted,
                            priority: req.body.priority,
                            privacy: req.body.privacy,
                            status: req.body.status
                        });
                        tasks[tasks.length] = req.body;
                        res.sendStatus(200);
                    }
                });
            });
        }
    });
    //Route to add assign newly created sub task to a parent task.
    app.put('/createsubtask', function (req, res) {
        //Error checking to determine if date has already passed - only checks if year has passed for now.
        let date = req.body.subtask.datetime.split("-");
        if (parseInt(date[0]) < 2022) {
            res.status(404).send();
        }
        else {
            tasks.find().toArray(function (err, docs) {
                if (err)
                    throw err;
                //Finds the parent task.
                docs.forEach((t) => {
                    if (t.name == req.body.parenttask) {
                        let subtasks;
                        if (!t.subtasks) {
                            subtasks = [];
                        }
                        else {
                            subtasks = t.subtasks;
                        }
                        let datearray = req.body.subtask.datetime.split(/[-:T]+/);
                        req.body.subtask.datetimeformat = monthNames[parseInt(datearray[1]) - 1] + " " + datearray[2] + " " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4];
                        subtasks[subtasks.length] = req.body.subtask;
                        tasks.updateOne({ name: t.name }, {
                            $set: {
                                name: t.name,
                                datetime: t.datetime,
                                subtasks: subtasks
                            }
                        });
                        res.sendStatus(200);
                    }
                });
            });
        }
    });
    //Route to register a new user.
    app.put('/register', function (req, res, next) {
        //Logins in newly registered user.
        req.session.loggedin = true;
        req.session.username = req.body.username;
        req.session.password = req.body.password;
        //Insert's newly registered user to the databas.
        users.insertOne({
            username: req.body.username,
            password: req.body.password,
            privacy: false
        });
        //Set's session's _id parameter to the newly created ObjectID
        users.find().toArray(function (err, docs) {
            if (err)
                throw err;
            docs.forEach((u) => {
                if (u.username == req.body.username) {
                    req.session._id = u._id;
                    if (!res.headersSent) {
                        res.sendStatus(200);
                    }
                }
            });
        });
    });
    //Route to edit a task.
    app.post('/edittask', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            //Finds the task to edit.
            docs.forEach((t) => {
                if (t.name == req.body.oldname) {
                    let comments;
                    if (!t.comments) {
                        comments = [];
                    }
                    else {
                        comments = t.comments;
                    }
                    for (var i = 0; i < req.body.comments.length; i++) {
                        let author = "Anonymous";
                        if (req.session.username) {
                            author = req.session.username;
                        }
                        req.body.comments[i].author = author;
                        comments.push(req.body.comments[i]);
                    }
                    let datearray = req.body.newdate.split(/[-:T]+/);
                    let newDatetimeformat = monthNames[parseInt(datearray[1]) - 1] + " " + datearray[2] + " " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4];
                    tasks.updateOne({ name: t.name }, { $set: {
                            name: req.body.newname,
                            datetime: req.body.newdate,
                            datetimeformat: newDatetimeformat,
                            comments: comments
                        } });
                    res.sendStatus(200);
                }
            });
        });
    });
    //Route to add a comment.
    app.post('/addcomment', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            //Finds the task to add the comment to.
            docs.forEach((t) => {
                if (t.name == req.body.name) {
                    let comments;
                    if (!t.comments) {
                        comments = [];
                    }
                    else {
                        comments = t.comments;
                    }
                    let author = "Anonymous";
                    if (req.session.username) {
                        author = req.session.username;
                    }
                    req.body.comment.author = author;
                    console.log(req.body.comment);
                    comments.push(req.body.comment);
                    tasks.updateOne({ name: t.name }, { $set: {
                            comments: comments
                        } });
                    res.sendStatus(200);
                }
            });
        });
    });
    //Route to edit a glossary entry.
    app.post('/editentry', function (req, res) {
        glossaryentries.find().toArray(function (err, docs) {
            if (err)
                throw err;
            //Finds the glossary entry to edit.
            docs.forEach((g) => {
                if (g.name == req.body.name) {
                    glossaryentries.updateOne({ name: g.name }, { $set: {
                            acronym: req.body.acronym,
                            definition: req.body.definition
                        } });
                    res.sendStatus(200);
                }
            });
        });
    });
    //Route to change a task's status from created to active.
    app.post('/starttask', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            //Finds the task to edit.
            docs.forEach((t) => {
                if (t.name == req.body.name) {
                    tasks.updateOne({ name: t.name }, { $set: {
                            status: 'Active'
                        } });
                    res.sendStatus(200);
                }
            });
        });
    });
    //Route to change a task's status from active to closed.
    app.post('/completetask', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            //Finds the task to edit.
            docs.forEach((t) => {
                if (t.name == req.body.name) {
                    tasks.updateOne({ name: t.name }, { $set: {
                            status: 'Closed'
                        } });
                    res.sendStatus(200);
                }
            });
        });
    });
    //Route to delete a task.
    app.delete('/deletetask', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            tasks.deleteOne({ name: req.body.name });
            res.sendStatus(200);
        });
    });
});
app.listen(3000);
console.log("Listening on port 3000");
