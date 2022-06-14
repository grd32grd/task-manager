task-manager

- A task management system that emulates well-known applications such as MS Planner, Jira, and Trello.

- The following dependencies are necessary for the application to run: typescript, pug, mongodb, connect-mongodb-session, express, express-session

- To install these dependencies, run the following commands:
    "npm i --save-dev typescript && npm i pug && npm i mongodb && npm i connect-mongodb-session && npm i express && npm i express-session"

- Run this command to convert all .ts files to .js files:
    "npx tsc"

- Utilize node.js to initalize the mongoDB database with the following command:
    "node db-init.js"

- Run this command to then setup the server"
    "node server.js"

- The application will then run locally on localhost:3000
  