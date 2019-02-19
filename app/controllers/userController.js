'use strict';

//Imports
let express = require("express");
let bodyParser = require("body-parser");
let userRepository = require("../repositories/userRepository");

//Create the express router
let router = express.Router()

//Create the userRepository instance
let repo = new userRepository();

//Router middleware definition
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(function (req, res, next) {   
    console.log(`${req.method} ${req.baseUrl} request from ${req.ip}`);
    next();
});

//GET definition
router.get("/:username", function(req, res) {  
    repo.fetchUserByUsername(req.params.username, function(user, err) {
        if (user !== undefined) {
            res.json(user);
        } else if (err === undefined) {
            res.json(404, {
                message: `Unable to fetch user ${req.params.username}`
            });
        } else {
            res.json(500, {
                message: "An error occurred while processing your request",
                error: err
            });
        }
    });
});

//POST definition
router.post("/", function(req, res) {  

    //Validate request body
    if (req.body === null || req.body === undefined) {
        res.json(400, {
            message: "Request body cannot be empty"
        });
        return;
    } else if (req.body.username === null || req.body.username === undefined || req.body.username === '') {
        res.json(400, {
            message: "Username property must be specified"
        });
        return;
    }

    //Ensure the user does not exist
    repo.fetchUserByUsername(req.body.username, function(user, err) {
        if (user !== undefined) {
            res.json(400, {
                message: `User with username ${req.body.username} already exists`
            });
        } else if (err === undefined) {
            //Create the user
            repo.createUser(req.body, function(err) {
                if (err === undefined) {
                    res.json(201, {
                        message: "User was created successfully"
                    });
                } else {
                    //Error occurred
                    res.json(500, {
                        message: "An error occurred while processing your request",
                        error: err
                    });
                }
            });
        } else {
            //Error occurred
            res.json(500, {
                message: "An error occurred while processing your request",
                error: err
            });
        }
    });
});

//PUT definition
router.put("/:username", function(req, res) {  

    //Validate request body
    if (req.body === null || req.body === undefined) {
        res.json(400, {
            message: "Request body cannot be empty"
        });
        return;
    } 

    //Ensure the user exists
    repo.fetchUserByUsername(req.params.username, function(user, err) {
        if (user !== undefined) {
            //Update the user
            req.body.id = user.id;
            repo.updateUser(req.params.username, req.body, function(err) {
                if (err === undefined) {
                    res.json(200, {
                        message: "User was updated successfully"
                    });
                } else {
                    //Error occurred
                    res.json(500, {
                        message: "An error occurred while processing your request",
                        error: err
                    });
                }
            });
        } else if (err === undefined) {
            res.json(404, {
                message: `Unable to fetch user ${req.params.username}`
            });
        } else {
            res.json(500, {
                message: "An error occurred while processing your request",
                error: err
            });
        }
    });
});

//DELETE definition
router.delete("/:username", function(req, res) {  
    repo.deleteUser(req.params.username, function(err) {
        if (err === undefined) {
            res.json(200, {
                message: `User was deleted successfully`
            });
        } else {
            res.json(500, {
                message: "An error occurred while processing your request",
                error: err
            });
        }
    });
});

//Export the express router object
module.exports = router;