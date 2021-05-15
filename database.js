const mongoose = require("mongoose");

class Database {
    constructor() {
        this.connect();
    }
    
    connect() {
        mongoose.connect("mongodb+srv://Bhanu:2E4U3Z66KEpKcCz1@cluster0.lb7gz.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority", { useNewUrlParser: true, 
        useUnifiedTopology: true, useCreateIndex : true })
        .then(() => {
            console.log("Database connection successful!!!");
        }).catch((err) => { 
            console.log("Database connection unsuccessful. Error : " + err);
        });
    }
}

module.exports = new Database();