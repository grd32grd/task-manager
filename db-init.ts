//Initial User Setup
type User = {
    username?: string;
    password?: string;
    privacy?: boolean;
};

let usernames = ["Guled", "Chris", "Phil"];
let users: User[] = [];

usernames.forEach(name => {
	let u:User = {
        username: name,
        password: name,
        privacy: false
    };
	users.push(u);
});

//MongoDB Setup
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db: any;

MongoClient.connect("mongodb://localhost:27017/", function(err: any, client: any) {
  if(err) throw err;	

  db = client.db('taskmanager');
  
  db.listCollections().toArray(function(err: any, result: any){
	 if(result.length == 0){
		 db.collection("users").insertMany(users, function(err: any, result: any){
			if(err){
				throw err;
			}
			
			console.log(result.insertedCount + " initial users were added (should be 3).");
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
					
					console.log(result.insertedCount + " initial users were added to the database (should be 3).");
					client.close();
				});
			}
		});		
	 });
  });
});

