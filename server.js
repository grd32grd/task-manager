"use strict";
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
    let sessions = client.db('taskmanager').collection('sessions');
    //Front Page
    app.get('/', function (req, res) {
        res.render('frontpage.pug', { session: req.session });
    });
    //Users Page
    app.get('/users', function (req, res) {
        users.find().toArray(function (err, docs) {
            if (err)
                throw err;
            let userprofiles = [];
            docs.forEach((u) => {
                if (req.query.name == undefined || u.username.toLowerCase().includes(req.query.name.toLowerCase())) {
                    userprofiles.push(u);
                }
            });
            res.render('users.pug', { users: userprofiles, session: req.session });
        });
    });
    //Tasks Page
    app.get('/tasks', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('tasks.pug', { tasks: docs, session: req.session });
        });
    });
    //Route to log a logged in user out.
    app.get('/logout', function (req, res) {
        req.session.loggedin = false;
        req.session.username = undefined;
        req.session.password = undefined;
        req.session._id = undefined;
        res.render('frontpage.pug', { session: req.session });
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
    //Route to a user's profile page.
    app.get('/users/:profileid', function (req, res) {
        tasks.find().toArray(function (err, docs) {
            if (err)
                throw err;
            res.render('profile.pug', { profile: res.userprofile, tasks: docs, session: req.session });
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
    //Route to get a user logged out of their account
    app.get('/logout', function (req, res) {
        req.session.loggedin = false;
        req.session.username = undefined;
        req.session.password = undefined;
        req.session._id = undefined;
        res.render('frontpage.pug', { session: req.session });
    });
    //Route to add assign newly created task to the logged in user.
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
                        tasks.insertOne({
                            username: u.username,
                            name: req.body.name,
                            datetime: req.body.datetime
                        });
                        tasks[tasks.length] = req.body;
                        res.status(200).send();
                    }
                });
            });
        }
    });
    //Register page
    app.get('/register', function (req, res) {
        res.render('register.pug');
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
                        res.status(200).send(JSON.stringify(req.session._id));
                    }
                }
            });
        });
    });
});
app.listen(3000);
console.log("Listening on port 3000");
