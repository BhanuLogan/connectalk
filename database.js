const mongoose = require("mongoose");

class Database {
    constructor() {
        this.connect();
    }
    
    connect() {
        //const uri = "mongodb+srv://Bhanu:2E4U3Z66KEpKcCz1@cluster0.lb7gz.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority"
        //if(process.env.environment == "production")
        const uri = "mongodb+srv://divya:4UWbEHyM7FbxkXcu@twitterclone.snzuf.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority"
        mongoose.connect(uri, { useNewUrlParser: true, 
        useUnifiedTopology: true, useCreateIndex : true })
        .then(() => {
            console.log("Database connection successful!!!");
        }).catch((err) => { 
            console.log("Database connection unsuccessful. Error : " + err);
        });
    }
}

module.exports = new Database();