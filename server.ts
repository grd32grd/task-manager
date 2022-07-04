//Setup
const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBUsers = require('connect-mongodb-session')(session);
const mc = require('mongodb').MongoClient;

//Const Variables
const monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

app.set('view engine', 'pug');
app.set('title','taskmanager');

//Methods


let mongoStore = new MongoDBUsers({
    uri: 'mongodb://localhost:27017/taskmanager',
    collection: 'sessions'
});
mongoStore.on('error', (error: any) => {console.log(error)});

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
app.use(express.urlencoded({extended: true}));

//Server
mc.connect("mongodb://localhost:27017", function(err : any, client : any) {
	if (err) {
		console.log("Error in connecting to database.");
		console.log(err);
		return;
	}

    let users = client.db('taskmanager').collection('users');
    let tasks = client.db('taskmanager').collection('tasks');
    let glossaryentries = client.db('taskmanager').collection('glossaryentries');
    let sessions = client.db('taskmanager').collection('sessions');

    //Prints Routes - for testing purposes
    /*
    app.all("*", (req: any, res: any, next: any) => {
        console.log(req.params);
        next();
    });
    */

    //Front Page
    app.get('/', function(req: any, res: any){
        if (req.session.loggedin != true){
            req.session.loggedin = false;
            req.session.username = undefined;
            req.session.password = undefined;
            req.session._id = undefined;
            req.session.lightmode = true;
        }
        res.render('frontpage.pug', {session : req.session});
    });

    //Glossary Page
    app.get('/glossary', function(req: any, res: any){
        glossaryentries.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('glossary.pug', {session : req.session, glossaryentries : docs.sort((a: any, b: any) => (a.name > b.name) ? 1 : -1)});
        });
        
    });

    //Create Glossary Entry Page
    app.get('/createentry', function(req: any, res: any){
        users.find().toArray(function(err: any, docs : any){
            if (err) throw err;

            res.render('createentry.pug', { users : docs, session : req.session });
        });
    });

    app.post('/switchmode', function(req: any, res: any){
        req.session.lightmode = !req.session.lightmode
        res.render('frontpage.pug', {session : req.session});
    });

    //Tasks Page
    app.get('/tasks', function(req: any, res: any){
        tasks.find().toArray(function(err: any, docs : any){
            if (err) throw err;

            res.render('tasks.pug', { tasks : docs, session : req.session });
        });
    });

    //Register page
    app.get('/register', function(req: any, res: any){
        res.render('register.pug', { session : req.session });
    });

    //Route to log a logged in user out.
    app.get('/logout', function(req: any, res: any){
        req.session.loggedin = false;
        req.session.username = undefined;
        req.session.password = undefined;
        req.session._id = undefined;
        res.render('frontpage.pug', {session : req.session});
    });

    //Create Task Page
    app.get('/createtask', function(req: any, res: any){
        users.find().toArray(function(err: any, docs : any){
            if (err) throw err;

            res.render('createtask.pug', { users : docs, session : req.session });
        });
    });

    //Parameter used to search for specific tasks
    app.param('tasksearch', function(req: any, res: any, next: any, value: any) {
        let searchedTasks: Task[] = [];
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            docs.forEach((t: Task) => {
                if (t.name.toUpperCase().includes(value.toUpperCase())) {
                    searchedTasks.push(t)
                }
            });
            res.searchedTasks = searchedTasks;
            next();
        });
    });

    //Tasks Page
    app.get('/tasks/:tasksearch', function(req: any, res: any){
        res.render('tasks.pug', { tasks : res.searchedTasks, session : req.session });
    });

    //Parameter used by a number of routes needing the id of a user's profile.
    app.param('profileid', function(req: any, res: any, next: any, value: any) {
        users.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            docs.forEach((u: User) => {
                if (u._id == value) {
                    res.userprofile = u;
                    next();
                }
            });
        });
    });

    //Parameter used to find the glossary entry corresponding with the name
    app.param('entryid', function(req: any, res: any, next: any, value: any) {
        glossaryentries.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            docs.forEach((g: GlossaryEntry) => {
                if (g._id == value) {
                    res.glossaryentry = g;
                    next();
                }
            });
        });
    });

    //Route to get to a glossary entry's page to view it's content and modify it's info
    app.get('/glossary/:entryid', function (req: any, res: any) {
        res.render('editentry.pug', {glossaryentry: res.glossaryentry, session: req.session});
    });

    //Route to get to a task's page to see detailed info as well as it's subtasks.
    app.get('/:taskid', function (req: any, res: any) {
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            //Iterates over the database to find the task with the given ID
            docs.forEach((t: { _id: any; }) => {
                if (t._id == req.params.taskid) {
                    res.render('createsubtask.pug', {task: t, session: req.session});
                }
            });
        });
    });

    //Route to get a user logged in
    app.put('/login', function(req: any,res: any){
        users.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            docs.forEach((u: User) => {
                if (u.username == req.body.username && u.password == req.body.password){
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
    app.put('/createentry', function(req: any,res: any){
        glossaryentries.insertOne({
            name: req.body.name,
            acronym: req.body.acronym,
            definition: req.body.definition
        });
        console.log(req.body.definition);
        console.log(req.body)
        res.sendStatus(200);
    }); 

    //Route to add newly created task and assign it to the logged in user.
    app.put('/createtask', function(req: any,res: any){

        //Error checking to determine if date has already passed - only checks if year has passed for now.
        let date:string = req.body.datetime.split("-");
        if (parseInt(date[0]) < 2022) {res.status(404).send();}
        else {
            users.find().toArray(function(err: any, docs: any){
                if (err) throw err;
    
                docs.forEach((u: User) => {
                    if (u.username == req.session.username && u.password == req.session.password){
                        
                        let datearray: string[] = req.body.datetime.split(/[-:T]+/);
                        let datetimeformatted: string = monthNames[parseInt(datearray[1])-1] + " " + datearray[2] + " " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4]

                        tasks.insertOne({
                            username: req.body.username,
                            name: req.body.name,
                            datetime: req.body.datetime,
                            datetimeformat: datetimeformatted,
                            priority: req.body.priority,
                            privacy: req.body.privacy
                        });
                        tasks[tasks.length] = req.body;
                        res.sendStatus(200);

                    }  
                });
            });
        }
    }); 

    //Route to add assign newly created sub task to a parent task.
    app.put('/createsubtask', function(req: any,res: any){

        //Error checking to determine if date has already passed - only checks if year has passed for now.
        let date:string = req.body.subtask.datetime.split("-");
        if (parseInt(date[0]) < 2022) {res.status(404).send();}
        else {
            tasks.find().toArray(function(err: any, docs: any){
                if (err) throw err;
    
                //Finds the parent task.
                docs.forEach((t: Task) => {
                    if (t.name == req.body.parenttask){
                        let subtasks: Task[];
                        if (!t.subtasks){
                            subtasks = [];
                        } else {
                            subtasks = t.subtasks
                        }

                        let datearray: string[] = req.body.subtask.datetime.split(/[-:T]+/);
                        req.body.subtask.datetimeformat = monthNames[parseInt(datearray[1])-1] + " " + datearray[2] + " " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4]
                        subtasks[subtasks.length] = req.body.subtask
                        tasks.updateOne({ name: t.name },{
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
    app.put('/register', function(req: any, res: any, next: any){

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
        users.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            docs.forEach((u: { username: any; _id: any; }) => {
                if (u.username == req.body.username){
                    req.session._id = u._id;
                    if (!res.headersSent){
                        res.sendStatus(200);
                    }
                }
            });  
        });
    });

    //Route to edit a task.
    app.post('/edittask', function(req: any,res: any){
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            //Finds the task to edit.
            docs.forEach((t: Task) => {
                if (t.name == req.body.oldname){
                    let comments: String[];
                    if (!t.comments){
                        comments = [];
                    } else {
                        comments = t.comments;
                    }
                    for (var i = 0; i < req.body.comments.length; i++){
                        comments.push(req.body.comments[i])
                    }
                    tasks.updateOne({ name: t.name },{ $set: {
                        name: req.body.newname,
                        datetime: req.body.newdate,
                        comments: comments
                    }});
                    res.sendStatus(200);
                }
            });
        });
    }); 

    //Route to add a comment.
    app.post('/addcomment', function(req: any,res: any){
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            //Finds the task to add the comment to.
            docs.forEach((t: Task) => {
                if (t.name == req.body.name){
                    let comments: String[];
                    if (!t.comments){
                        comments = [];
                    } else {
                        comments = t.comments;
                    }
                    if (!req.session.username){
                        comments.push(req.body.comment + " - made by anonymous.")
                    } else {
                        comments.push(req.body.comment + " - made by " + req.session.username + ".")
                    }
                    tasks.updateOne({ name: t.name },{ $set: {
                        comments: comments
                    }});
                    res.sendStatus(200);
                }
            });
        });
    });

    //Route to edit a glossary entry.
    app.post('/editentry', function(req: any,res: any){
        glossaryentries.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            //Finds the glossary entry to edit.
            docs.forEach((g: GlossaryEntry) => {
                if (g.name == req.body.name){
                    glossaryentries.updateOne({ name: g.name },{ $set: {
                        acronym: req.body.acronym,
                        definition: req.body.definition
                    }});
                    res.sendStatus(200);
                }
            });
        });
    }); 
});


app.listen(3000);
console.log("Listening on port 3000");