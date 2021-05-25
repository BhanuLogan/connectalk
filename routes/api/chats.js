const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const Chat = require('../../schemas/ChatSchema');

const router = express.Router();


app.use(bodyParser.urlencoded({ extended : false }));

router.post("/", async (req, res, next) => {
    if(!req.body.users) {
        console.log("users param is not sent in the request.");
        return res.sendStatus(400);
    }
    let users = JSON.parse(req.body.users);
    if(users.length == 0){
        console.log("users array is empty");
        return res.sendStatus(400);
    }
    users.push(req.session.user);
    const chatData = {
        users,
        isGroupChat : true
    }
    Chat.create(chatData)
    .then(results => res.status(200).send(results))
    .catch(err => {
        console.log(err);
        return res.sendStatus(400);
    });
});

router.get("/", (req, res, next) => {
    Chat.find({ users : { $elemMatch : { $eq : req.session.user._id } }})
    .populate("users")
    .sort({ updatedAt : -1 })
    .then(results => res.status(200).send(results))
    .catch(err => {
        console.log(err);
        return res.sendStatus(400);
    })
});


module.exports = router;