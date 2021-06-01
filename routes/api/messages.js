const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');

const router = express.Router();


app.use(bodyParser.urlencoded({ extended : false }));

router.post("/", async (req, res, next) => {
    if(!req.body.content || !req.body.chatId){
        console.log("Invalid data from client");
        return res.sendStatus(400);
    }
    const newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    }
    Message.create(newMessage)
    .then(async message => {
        message = await message.populate("sender").execPopulate(); 
        message = await message.populate("chat").execPopulate(); 

        Chat.findByIdAndUpdate(req.body.chatId, { latestMessage : message }, { useFindAndModify : false})
        .catch(err => console.log(err));
        return res.status(201).send(message);
    }).catch(err => {
        console.log(err);
        return res.sendStatus(400);
    })
});


module.exports = router;