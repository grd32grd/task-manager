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
        users.find().toArray(function(err: any, docs : any){
            if (err) throw err;

            let userprofiles : User[] = [];
            docs.forEach((u : User) => {
                if ( u.privacy == false && (req.query.name == undefined || u.username.toLowerCase().includes(req.query.name.toLowerCase() )) ){
                    userprofiles.push(u);                
                }
            });

            res.render('frontpage.pug', { users : userprofiles, session : req.session });
        });
    });

    //Login Page
    

        
});


app.listen(3000);
console.log("Listening on port 3000");

