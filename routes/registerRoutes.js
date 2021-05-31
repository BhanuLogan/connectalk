const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/User");


app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended :false}));

router.get("/", (req, res, next) => {
    
    res.status(200).render("register");
})

router.post("/", (req, res, next) => {
    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    let username = req.body.username.trim();
    let email = req.body.email.trim();
    let password = req.body.password;

    let data = { firstName : firstName, lastName: lastName, username, email, password };
    let payload = req.body;
    if(firstName && lastName && username && email && password){
        User.findOne({
            $or : [
                { username : username}, 
                { email }
            ]
        })
        .then((results) => {
            if(results != null){
                payload.errorMessage = "User already exists";
                return res.status(200).render("register", payload);
            }
            User.insertMany(data)
            .then((results) => {
                res.status(200).send(results);
            }).catch((err) => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        });
        
    }else{  
        payload.errorMessage = "Fill all the fields";
        res.status(200).render("register", payload);
    }
})

module.exports = router;