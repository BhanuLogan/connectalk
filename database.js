const mongoose = require("mongoose");

class Database {
    constructor(){
        this.connect();
    }

    connect() {
        const uri = "mongodb+srv://divya:4UWbEHyM7FbxkXcu@twitterclone.snzuf.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority"
        mongoose.connect(uri, { useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : false })
        .then(() => {
            console.log("Database connected successfully");
        }).catch(err => {
            console.log(err);
        });

       
    }
}
module.exports = new Database();