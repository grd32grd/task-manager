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
    let sessions = client.db('taskmanager').collection('sessions');

    //Front Page
    app.get('/', function(req: any, res: any){
        res.render('frontpage.pug', {session : req.session});
    });

    //Users Page
    app.get('/users', function(req: any, res: any){
        users.find().toArray(function(err: any, docs : any){
            if (err) throw err;

            let userprofiles : User[] = [];
            docs.forEach((u : User) => {
                if (req.query.name == undefined || u.username.toLowerCase().includes(req.query.name.toLowerCase())){
                    userprofiles.push(u);                
                }
            });

            res.render('users.pug', { users : userprofiles, session : req.session });
        });
    });

    app.get('/tasks', function(req: any, res: any){
        users.find().toArray(function(err: any, docs : any){
            if (err) throw err;

            let userprofiles : User[] = [];
            docs.forEach((u : User) => {
                if (req.query.name == undefined || u.username.toLowerCase().includes(req.query.name.toLowerCase())){
                    userprofiles.push(u);                
                }
            });

            res.render('tasks.pug', { users : userprofiles, session : req.session });
        });
    });

    //Route to log a logged in user out.
    app.get('/logout', function(req: any, res: any){

        req.session.loggedin = false;
        req.session.username = undefined;
        req.session.password = undefined;
        req.session._id = undefined;

        res.render('frontpage.pug', {session : req.session});
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

    //Route to a user's profile page.
    app.get('/users/:profileid', function (req: any, res: any) {
        res.render('profile.pug', {profile: res.userprofile, session: req.session});
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

    //Route to add assign newly created task to the logged in user.
    app.put('/createtask', function(req: any,res: any){
        users.find().toArray(function(err: any, docs: any){
            if (err) throw err;

            docs.forEach((u: User) => {
                if (u.username == req.session.username && u.password == req.session.password){
                    let userTasks: Task[] = [];
                    let taskId: number;

                    //Adds the new task to the user's tasklist.
                    if (!u.tasks){
                        taskId = 0;
                    } else {
                        userTasks = u.tasks;
                        taskId = Object.keys(u.tasks).length;
                    }

                    //Updates the logged in user's tasklist in the database.
                    userTasks[taskId] = req.body;
                    users.updateOne({ _id: u._id },{
                        $set: {
                            username: u.username,
                            password: u.password,
                            tasks: userTasks
                        }
                    });

                    res.status(200).send();
                }
            });
        });
    });
    
    

        
});


app.listen(3000);
console.log("Listening on port 3000");

