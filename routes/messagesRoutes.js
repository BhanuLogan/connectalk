const express = require('express');
const Chat = require('../schemas/ChatSchema');
const app = express();
const User = require("../schemas/UserSchema");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", async (req, res, next) => {
    res.status(200).render("inboxPage", {
        pageTitle : "Inbox",
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user)
    });
});
router.get("/new", async (req, res, next) => {
    res.status(200).render("newMessage", {
        pageTitle : "New message",
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user)
    });
});

router.get("/:chatId", async (req, res, next) => {
    let userId = req.session.user._id;
    let chatId = req.params.chatId;
    let isValidId = mongoose.isValidObjectId(chatId);
    let payload = {
        pageTitle : "Chat",
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user)
    }
    if(!isValidId){
        payload.errorMessage = "chat doesn't exist or you have no permission to view it.";
        return res.status(200).send("chatPage", payload);
    }
    let chat = await Chat.findOne({ _id : chatId, users : { $elemMatch : { $eq : userId }}})
    .populate("users");
    
    if(chat == null){
        let userFound = await User.findById(chatId);
        
        if(userFound != null){
            chat = await getChatByUserId(userFound._id, userId);
        }
    }
    if(chat == null){
        payload.errorMessage = "chat doesn't exist or you have no permission to view it.";
    }else{
        payload.chat = chat;
    }
    res.status(200).render("chatPage", payload);
});

function getChatByUserId(otherUserId, userLoggedInId) {
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users : {
            $size : 2,
            $all : [
                { $elemMatch : { $eq : mongoose.Types.ObjectId(userLoggedInId) }},
                { $elemMatch : { $eq : mongoose.Types.ObjectId(otherUserId) }}
            ]
        }
    }, {
        $setOnInsert : {
            users : [ userLoggedInId, otherUserId ]
        }
    },{
        new : true,
        upsert: true,
        useFindAndModify: false
    }).populate("users"); 
}

module.exports = router;