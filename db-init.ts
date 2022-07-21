//Type Aliases
type CommentType = {
	type: 'user-comment' | 'modification' | 'feedback';
	comment: string;
	replies?: CommentType[];
	author?: string
};
type Task = {
    _id?: any;
	name: string;
	users?: string[];
	description?: string;
    datetime: string;
	datetimeformat?: string;
	privacy?: boolean;
	comments?: CommentType[];
	subtasks?: Task[];
	status: 'Backlog' | 'In Progress' | 'On Hold' | 'Completed';
	priority: 'High' | 'Medium' | 'Low'
};
type User = {
	_id?: string
    username: string;
    password: string
};
type GlossaryEntry = {
    _id?: any;
	name: string;
	acronym: string;
	definition: string;
	category?: string
};

//Variables
let tasks = [
	{users: ["Guled"], name: "Finish Task Manager Demo", description: "Create the application.", datetime:"2022-07-14T14:00", datetimeformat: "July 14, 2022 @ 14:00", priority: "High", status: "In Progress" },
	{users: ["Chris"], name: "Analyze Task Manager Demo Code", description: "Go over snippets of the application's code.", datetime:"2022-07-14T14:30", datetimeformat: "July 14, 2022 @ 14:30", priority: "Medium", status: "Backlog"},
	{users: ["Phil"], name: "Critique Task Manager Demo", description: "Come up with a list of improvements.", datetime:"2022-07-14T14:30", datetimeformat: "July 14, 2022 @ 14:30", priority: "Medium", status: "Backlog"}
]

let glossaryentries = [
	{acronym: 'PaaS', name: 'Platform as a Service', definition: 'A cloud computing model where a third-party provider delivers hardware and software tools to users over the internet.'},
	{acronym: 'DMZ', name: 'Demilitarized Zone', definition: 'A part of the network that is located between any two policy-enforcing components of the network and that enables an organization to host its own Internet services.'},
	{acronym: 'AG', name: 'Access Governance', definition: 'An aspect of information technology security management that seeks to reduce the risks associated with end users who have unnecessary access privileges.'},
	{acronym: 'IBS', name: 'Internal Boundary System', definition: 'A gateway that connects two or more Internetworks within a Network Security Zone.'},
	{acronym: 'DOM', name: 'Document Object Model', definition: 'A programming interface specification that lets a programmer create and modify HTML pages and XML documents as program elements.'}
]

let prioritylevels = [
	{level: 1, color: "#FF00FB"}, {level: 2, color: "#9500FF"}, {level: 3, color: "#1500FF"}, {level: 4, color: "#007BFF"}, {level: 5, color: "#00FFFB"},
	{level: 6, color: "#51FF00"}, {level: 7, color: "#EAFF00"}, {level: 8, color: "#FFC800"}, {level: 9, color: "#FF5E00"}, {level: 10, color: "#FF0000"}
]

let usernames = ["Guled", "Chris", "Phil"];
let users: User[] = [];

usernames.forEach(name => {
	let u:User = {
        username: name,
        password: name,
    };
	users.push(u);
});

//MongoDB Setup
let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let db: any;

MongoClient.connect("mongodb://localhost:27017/", function(err: any, client: any) {
	if(err) throw err;	

	db = client.db("taskmanager");
  
	db.listCollections().toArray(function(err: any, result: any){
		if(result.length == 0){
			db.collection("users").insertMany(users, function(err: any, result: any){
				if(err){
					throw err;
				}
			
				console.log(result.insertedCount + " initial users were added (should be 3).");
				client.close();
			});
			db.collection("tasks").insertMany(tasks, function(err: any, result: any){
				if(err){
					throw err;
				}
			
				console.log(result.insertedCount + " initial tasks were added (should be 3).");
				client.close();
			});
			db.collection("glossaryentries").insertMany(glossaryentries, function(err: any, result: any){
				if(err){
					throw err;
				}
			
				console.log(result.insertedCount + " initial glossary entries were added (should be 5).");
				client.close();
			});
			
			return;
		}
	 
		let numDropped = 0;
		let toDrop = result.length;
		result.forEach((collection: { name: string; }) => {
			db.collection(collection.name).drop(function(err: any, delOK: any){
				if(err){
					throw err;
				}
			
				console.log("Dropped collection: " + collection.name);
				numDropped++;
			
				if(numDropped == toDrop){
					db.collection("users").insertMany(users, function(err: any, result: any){
						if(err){
							throw err;
						}
					
						console.log(result.insertedCount + " initial users were added (should be 3).");
						client.close();
					});
					db.collection("tasks").insertMany(tasks, function(err: any, result: any){
						if(err){
							throw err;
						}
					
						console.log(result.insertedCount + " initial tasks were added (should be 3).");
						client.close();
					});
					db.collection("glossaryentries").insertMany(glossaryentries, function(err: any, result: any){
						if(err){
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
