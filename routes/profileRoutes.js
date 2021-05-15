const express = require('express');
const app = express();
const User = require("../schemas/UserSchema");

const router = express.Router();

router.get("/", async (req, res, next) => {
    var payload = {
        pageTitle : req.session.user.username,
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user),
        profileUser : req.session.user
    }

    res.status(200).render("profilePage", payload);
})
router.get("/:id", async (req, res, next) => {
    var payload = await getPayload(req.params.id, req.session.user);

    res.status(200).render("profilePage", payload);
})
router.get("/:id/replies", async (req, res, next) => {
    var payload = await getPayload(req.params.id, req.session.user);
    payload.selectedTab = "replies";

    res.status(200).render("profilePage", payload);
})
router.get("/:username/following", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";

    res.status(200).render("followersAndFollowing", payload);
})
router.get("/:username/followers", async (req, res, next) => {
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";

    res.status(200).render("followersAndFollowing", payload);
})
async function getPayload(username, userLoggedIn){
    let user = await User.findOne({ username });
    if(user == null){
        user = await User.findById(username);
        if(user == null) {
            return {
                pageTitle : "user not found",
                userLoggedIn,
                userLoggedInJS : JSON.stringify(userLoggedIn)
            }
        }
    }

    return {
        pageTitle : user.username,
        userLoggedIn,
        userLoggedInJS : JSON.stringify(userLoggedIn),
        profileUser : user
    }
}

module.exports = router;