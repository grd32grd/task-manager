//Const Variables
const monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//Setup
const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBUsers = require('connect-mongodb-session')(session);
const mc = require('mongodb').MongoClient;

app.set('view engine', 'pug');
app.set('title','taskmanager');

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
    let feedback = client.db('taskmanager').collection('feedback');

    //Search Page
    app.get('/search', function(req: any, res: any){
        res.render('search.pug', { tasks : {}, glossaryentries: {}, session : req.session });
    });

    //Login Page
    app.get('/login', function(req: any, res: any){
        res.render('login.pug', { session : req.session });
    });

    //Filtered Tasks Search Page
    app.param('taskfilter', function(req: any, res: any, next: any, value: any) {
        let filteredTasks: Task[] = [];

        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            docs.forEach((t: Task) => {
                if (t.name.toUpperCase().includes(value.toUpperCase())) {
                    filteredTasks.push(t);
                }
            });
            res.filteredTasks = filteredTasks;
            next();
        });
    });
    app.get('/search/tasks/:taskfilter', function(req: any, res: any){
        res.render('search.pug', { tasks : res.filteredTasks, glossaryentries: {}, session : req.session });
    });

    //Filtered Glossary Entries Search Page
    app.param('glossaryfilter', function(req: any, res: any, next: any, value: any) {
        let filteredEntries: GlossaryEntry[] = [];

        glossaryentries.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            docs.forEach((g: GlossaryEntry) => {
                if (g.name.toUpperCase().includes(value.toUpperCase())) {
                    filteredEntries.push(g);
                }
            });
            res.filteredEntries = filteredEntries;
            next();
        });
    });
    app.get('/search/glossary/:glossaryfilter', function(req: any, res: any){
        res.render('search.pug', { tasks : {}, glossaryentries: res.filteredEntries, session : req.session });
    });
    
    //Tasks Page - card View
    app.get('/', function(req: any, res: any){
        if (req.session.loggedin != true){
            req.session.loggedin = false;
            req.session.username = undefined;
            req.session.password = undefined;
            req.session._id = undefined;
            req.session.lightmode = true;
        } else {
            res.redirect(req.session.href);
        }
        tasks.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('tasks_card.pug', { tasks : docs, session : req.session });
        });
    });
    app.get('/tasks/card', function(req: any, res: any){
        req.session.href = '/tasks/card';
        tasks.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('tasks_card.pug', { tasks : docs, session : req.session });
        });
    });

    //Tasks Page - List View
    app.get('/tasks/list', function(req: any, res: any){
        req.session.href = '/tasks/list';
        tasks.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('tasks_list.pug', { tasks : docs, session : req.session });
        });
    });

    //Route to get to a full comments page.
    app.get('/comments', function(req: any, res: any){
        req.session.href = '/comments';
        res.render('comments.pug', {session : req.session});
    });

    //Glossary Page
    app.get('/glossary', function(req: any, res: any){
        req.session.href = '/glossary';
        glossaryentries.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('glossary.pug', {session : req.session, glossaryentries : docs.sort((a: any, b: any) => (a.name > b.name) ? 1 : -1)});
        }); 
    });

    //Parameter used to search for specific glossary entries
    app.param('glossarysearch', function(req: any, res: any, next: any, value: any) {
        let searchedEntries: GlossaryEntry[] = [];
        glossaryentries.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            docs.forEach((g: GlossaryEntry) => {
                if (g.name.toUpperCase().includes(value.toUpperCase())) {
                    searchedEntries.push(g);
                }
            });
            res.searchedEntries = searchedEntries;
            next();
        });
    });
    app.get('/glossary/:glossarysearch', function(req: any, res: any){
        res.render('glossary.pug', { glossaryentries : res.searchedEntries.sort((a: any, b: any) => (a.name > b.name) ? 1 : -1), session : req.session });
    });

    //Create Glossary Entry Page
    app.get('/createentry', function(req: any, res: any){
        req.session.href = '/createentry';
        users.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('createentry.pug', { users : docs, session : req.session });
        });
    });

    //Register page
    app.get('/register', function(req: any, res: any){
        req.session.href = '/register';
        res.render('register.pug', { session : req.session });
    });

    //Route to log a logged in user out.
    app.get('/logout', function(req: any, res: any){
        req.session.href = '/tasks/card';
        req.session.loggedin = false;
        req.session.username = undefined;
        req.session.password = undefined;
        req.session._id = undefined;
        tasks.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('tasks_card.pug', { tasks : docs, session : req.session });
        });
    });

    //Create Task Page
    app.get('/createtask', function(req: any, res: any){
        req.session.href = '/createtask';
        users.find().toArray(function(err: any, docs : any){
            if (err) throw err;
            res.render('createtask.pug', { users : docs, session : req.session });
        });
    });

    //Feedback Page
    app.get('/feedback', function(req: any, res: any){
        req.session.href = '/feedback';
        res.render('feedback.pug', {session : req.session });
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
    app.get('/tasks/card/:tasksearch', function(req: any, res: any){
        res.render('tasks_card.pug', { tasks : res.searchedTasks, session : req.session });
    });
    app.get('/tasks/list/:tasksearch', function(req: any, res: any){
        res.render('tasks_list.pug', { tasks : res.searchedTasks, session : req.session });
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

    //Parameter used to find the glossary entry corresponding with the id
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
    app.get('/glossaryentry/:entryid', function (req: any, res: any) {
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

    //Parameter used to find the task with the given id
    app.param('taskid', function(req: any, res: any, next: any, value: any) {
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            docs.forEach((t: Task) => {
                if (t._id == value) {
                    res.task = t;
                    next();
                }
            });
        });
    });
    //Route to delete a task.
    app.get('/deletetask/:taskid', function(req: any, res: any){
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            tasks.deleteOne({ _id: res.task._id })
            res.redirect('back');
        });
    });

    //Route to start a task.
    app.get('/starttask/:taskid', function(req: any, res: any){
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            //Find way to uniquely identify
            tasks.updateOne({ _id: res.task._id  },{ $set: {
                status: 'In Progress'
            }});
            res.redirect('back');
        });
    });

    //Route to put a task on hold.
    app.get('/puttaskonhold/:taskid', function(req: any, res: any){
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            //Find way to uniquely identify
            tasks.updateOne({ _id: res.task._id  },{ $set: {
                status: 'On Hold'
            }});
            res.redirect('back');
        });
    });

    //Route to complete a task.
    app.get('/completetask/:taskid', function(req: any, res: any){
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;
            //Find way to uniquely identify
            tasks.updateOne({ _id: res.task._id  },{ $set: {
                status: 'Completed'
            }});
            res.redirect('back');
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
                    res.sendStatus(200);
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
        if (parseInt(date[0]) < 2022) {res.sendSatus(404);}
        else if (!req.body.users) {res.sendStatus(405);}
        else if (!req.body.datetime) {res.sendStatus(406);}
        else {   
            let datearray: string[] = req.body.datetime.split(/[-:T]+/);
            let datetimeformatted = monthNames[parseInt(datearray[1])-1] + " " + datearray[2] + ", " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4]

            tasks.insertOne({
                users: req.body.users,
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

    //Route to add assign newly created sub task to a parent task.
    app.put('/createsubtask', function(req: any, res: any){

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
                        req.body.subtask.datetimeformat = monthNames[parseInt(datearray[1])-1] + " " + datearray[2] + ", " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4];
                        subtasks[subtasks.length] = req.body.subtask
                        //Find way to uniquely identify
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

    app.put('/feedback', function(req: any, res: any){
    
        feedback.insertOne({
            type: req.body.type,
            comment: req.body.comment
        })
        if (req.session.username){
            //Find way to uniquely identify
            feedback.updateOne({comment: req.body.comment},{ $set: {
                author: req.session.username
            }});
        }
        res.sendStatus(200);
    });



    //Route to edit a task.
    app.post('/edittask', function(req: any,res: any){
        tasks.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            //Finds the task to edit.
            docs.forEach((t: Task) => {
                if (t.name == req.body.oldname){
                    let comments: CommentType[];
                    if (!t.comments){ comments = []} 
                    else { comments = t.comments}

                    for (var i = 0; i < req.body.comments.length; i++){
                        let author = "Anonymous";
                        if (req.session.username){ author = req.session.username}
                        req.body.comments[i].author = author;
                        comments.push(req.body.comments[i])
                    }
                    
                    let datearray: string[] = req.body.newdate.split(/[-:T]+/);
                    let newDatetimeformat = monthNames[parseInt(datearray[1])-1] + " " + datearray[2] + ", " + datearray[0] + " @ " + datearray[3] + ":" + datearray[4];

                    //Find way to uniquely identify
                    tasks.updateOne({ name: t.name },{ $set: {
                        name: req.body.newname,
                        datetime: req.body.newdate,
                        datetimeformat: newDatetimeformat,
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
                    let comments: CommentType[];
                    if (!t.comments){ comments = []} 
                    else { comments = t.comments}

                    let author = "Anonymous";
                    if (req.session.username){ author = req.session.username}
                    req.body.comment.author = author;

                    comments.push(req.body.comment)
                    //Find way to uniquely identify
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
                    //Find way to uniquely identify
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