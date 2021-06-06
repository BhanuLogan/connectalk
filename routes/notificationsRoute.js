const express = require('express');
const Chat = require('../schemas/ChatSchema');
const app = express();
const User = require("../schemas/UserSchema");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", async (req, res, next) => {
    res.status(200).render("notificationsPage", {
        pageTitle : "Notifications",
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user)
    });
});

module.exports = router;