const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const User = require("../../schemas/UserSchema");
const bcrypt = require("bcrypt");
const Post = require('../../schemas/PostSchema');
const multer = require("multer");
const upload = multer({ dest : "uploads/" });
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Notification = require('../../schemas/NotificationSchema');

app.use(bodyParser.urlencoded({ extended : false }));

router.get("/", async (req, res, next) => {
    let searchObj = req.query;
    if(searchObj.search !== undefined){
        searchObj = {
            $or : [
                { firstName : { $regex : searchObj.search, $options : "i "}},
                { lastName : { $regex : searchObj.search, $options : "i "}},
                { username : { $regex : searchObj.search, $options : "i "}}
            ]
        }
    }
    User.find(searchObj)
    .then(results => res.status(200).send(results))
    .catch(err => {
        console.log(err);
        return res.sendStatus(400);
    })
});

router.put("/:userId/follow", async (req, res, next) => {
    let userId = req.params.userId;

    let user = await User.findById(userId);
    if(user == null) return res.sendStatus(404);

    let isFollowing = user.followers && user.followers.includes(req.session.user._id);
    let option = isFollowing ? "$pull" : "$addToSet";
    
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, 
        { [option] : { following : userId }}, 
        { new : true, useFindAndModify: false})
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    }) 
    
    User.findByIdAndUpdate(userId, 
        {[option] : { followers : req.session.user._id }}, 
        { new : true, useFindAndModify: false})
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })
    if(!isFollowing){
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
    }

    res.status(200).send(req.session.user);
});

router.get("/:userId/following", async (req, res, next) => {
    User.findById(req.params.userId)
    .populate("following")
    .then(results => {
        return res.status(200).send(results);
    }).catch(err => {
        console.log(err);
        res.sendStatus(400);
    })
})
router.get("/:userId/followers", async (req, res, next) => {
    User.findById(req.params.userId)
    .populate("followers")
    .then(results => {
        return res.status(200).send(results);
    }).catch(err => {
        console.log(err);
        res.sendStatus(400);
    })
})
router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file){
        console.log("No file uploaded with ajax request");
        return res.sendStatus(400);
    }
    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path;
    let targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if(error != null){
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic : filePath }, { new : true, useFindAndModify: false });
        res.sendStatus(204);
    });
})

router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
    if(!req.file){
        console.log("No file uploaded with ajax request");
        return res.sendStatus(400);
    }
    let filePath = `/uploads/images/${req.file.filename}.png`;
    let tempPath = req.file.path;
    let targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async error => {
        if(error != null){
            console.log(error);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto : filePath }, { new : true, useFindAndModify : false });
        res.sendStatus(204);
    });
})

router.put("/:userId/updateOnlineStatus", async (req, res, next) => {
    if(!req.body){
        console.log("No data sent in body");
        return res.sendStatus(400);
    }

    var user = await User.findById(req.params.userId);
    if(user == null) return res.sendStatus(404);

    User.findByIdAndUpdate(req.params.userId, req.body, { useFindAndModify : false})
    .then(() => res.sendStatus(204))
    .catch(err => {
        console.log(err);
        return res.sendStatus(400);
    })
});
module.exports = router;