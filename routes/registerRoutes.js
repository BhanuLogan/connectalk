const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");
const bcrypt = require("bcrypt");

const router = express.Router();

app.set("view engine", "pug");
app.set("views", "views");

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
    }
})

module.exports = router;