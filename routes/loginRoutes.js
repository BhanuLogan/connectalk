<<<<<<< HEAD
const express = require("express");
const app = express();
const router = express.Router();

app.set("view engine","pug");
app.set("views","views");

router.get("/", (req,res,next) => {
 
    res.status(200).render("login");
});

=======
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

    res.status(200).render("login");
})

router.post("/", async (req, res, next) => {
    let payload = req.body;
    if(req.body.username && req.body.password){
        let user = await User.findOne({
            $or : [
                {username : req.body.username},
                {email : req.body.username}
            ]
        }).catch(error => {
            console.log(error);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("login", payload);
        });

        if(user != null){
            var result = await bcrypt.compare(req.body.password, user.password);
            if(result){
                req.session.user = user;
                return res.redirect("/");
            }
        }
        payload.errorMessage = "Invalid credentials.";
        return res.status(200).render("login", payload);
    }
    payload.errorMessage = "Make sure each field has a valid value.";
    res.status(200).render("login", payload);
})
>>>>>>> f9931174a2be942912b86c38df3dc4172b7bbbd7
module.exports = router;