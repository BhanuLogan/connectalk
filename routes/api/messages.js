const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
const User = require('../../schemas/UserSchema');
const Notification = require('../../schemas/NotificationSchema');

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
        message = await User.populate(message, { path : "chat.users"});
        var chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage : message }, { useFindAndModify : false})
        .catch(err => console.log(err));
        insertNotifications(chat, message);
        return res.status(201).send(message);
    }).catch(err => {
        console.log(err);
        return res.sendStatus(400);
    })
});


function insertNotifications(chat, message){
    chat.users.forEach(userId => {
        if(userId == message.sender._id.toString()) return ;
        Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
    });
}


module.exports = router;