'use strict';

//Imports
let cassandra = require("cassandra-driver");
let config = require('../config/config.json');
let user = require("../models/user");

//Init cassandra client
let client = new cassandra.Client({ 
    contactPoints: config.cassandra_contactPoints, 
    localDataCenter: "datacenter1", 
    keyspace: "users" 
});

//Define exported user repository functions
module.exports = function () { 
    
    //Fetch user by username
    this.fetchUserByUsername = function(username, callback) {
        
        console.log(`Attempting to fetch user with username: ${username}`);

        //Define the CQL statement
        let query = "SELECT * FROM users.user WHERE username = ? limit 1";

        //Execute the query
        client.execute(query, [username], { prepare: true }, function (err, resultSet) {  
            //Handle the result of the query     
            if (resultSet !== undefined && resultSet !== null && resultSet.rows.length === 1) {
                //Success, return the user object
                console.log(`Found user with username: ${username}`);
                let result = resultSet.first();
                callback(new user(result.id, result.username, result.password, result.email), undefined);
            }
            else if (err === undefined || err === null) {
                //Fail, user not found
                console.log(`Unable to find user with username ${username}`);
                callback(undefined, undefined);
            } else {
                //Fail, error occurred
                console.error(`${err}`);
                callback(undefined, err);
            }
        });
    }

    //Create user
    this.createUser = function(user, callback) {
    
        console.log(`Attempting to create user with username: ${user.username}`);

        //Define the CQL statement
        let query = "INSERT INTO users.user (id, username, password, email) VALUES (uuid(), ?, ?, ?)";

        //Execute the query
        client.execute(query, [user.username, user.password, user.email], { prepare: true }, function (err) {   
            //Handle the result of the query     
            if (err !== undefined && err !== null) {
                //Fail, error occurred
                console.error(`${err}`);
                callback(err);
            } else {
                console.log(`Created user with username: ${user.username}`);
                callback(undefined);
            }
        });
    }

    //Update user
    this.updateUser = function(originalUsername, user, callback) {

        console.log(`Attempting to update user with username: ${originalUsername}`);

        //Define the CQL statement
        let query = "UPDATE users.user SET password=?, email=? WHERE username=? and id=?";

        //Execute the query
        client.execute(query, [user.password, user.email, originalUsername, user.id], { prepare: true }, function (err) {   
            //Handle the result of the query     
            if (err !== undefined && err !== null) {
                //Fail, error occurred
                console.error(`${err}`);
                callback(err);
            } else {
                console.log(`Updated user with username: ${originalUsername}`);
                callback(undefined);
            }
        });
    }

    //Delete user
    this.deleteUser = function(username, callback) {

        console.log(`Attempting to delete user with username: ${username}`);

        //Define the CQL statement
        let query = "DELETE FROM users.user WHERE username = ?";

        //Execute the query
        client.execute(query, [username], { prepare: true }, function (err) {   
            //Handle the result of the query     
            if (err !== undefined && err !== null) {
                //Fail, error occurred
                console.error(`${err}`);
                callback(err);
            } else {
                console.log(`Deleted user with username: ${username}`);
                callback(undefined);
            }
        });
    }
};