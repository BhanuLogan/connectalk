const express = require('express');
const app = express();
<<<<<<< HEAD
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/User");

=======
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");
const bcrypt = require("bcrypt");

const router = express.Router();
>>>>>>> f9931174a2be942912b86c38df3dc4172b7bbbd7

app.set("view engine", "pug");
app.set("views", "views");

<<<<<<< HEAD
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
=======
app.use(bodyParser.urlencoded({ extended : false }));

router.get("/", (req, res, next) => {

    res.status(200).render("register");
})

router.post("/", async (req, res, next) => {
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var email = req.body.email.trim();
    var username = req.body.username.trim();
    var password = req.body.password;
    var payload = req.body;
    if(firstName && lastName && email && username && password){
        let user = await User.findOne({
            $or : [
                {email},
                {username}
            ]
        }).catch(err => {
            console.log(err);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("register", payload);
        });

        if(user){
            if(email == user.email){
                payload.errorMessage = "Email already in use.";
            }else{
                payload.errorMessage = "Username already in use.";
            }
            res.status(200).render("register", payload);  
        }else{
            let data = req.body;
            data.password = await bcrypt.hash(data.password, 10);
            User.create(data)
            .then((user) => {
                req.session.user = user;
                return res.redirect("/");
            });
        }
    }else{
        payload.errorMessage = "Make sure that every field has a valid value."
        res.status(200).render("register", payload);    
>>>>>>> f9931174a2be942912b86c38df3dc4172b7bbbd7
    }
})

module.exports = router;