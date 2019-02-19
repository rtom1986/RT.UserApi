"use strict";

//Imports
let express = require("express");
let config = require('./config/config.json');
let userController = require("./controllers/userController");

//Create the express server
let app = express();
let port = config.node_port;

//Register routes and middleware
app.use("/users", userController);

//Start the server
app.listen(port, () => console.log(`API server started on port ${port}`));
