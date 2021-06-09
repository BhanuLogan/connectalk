const express = require('express');
const app = express();
const User = require("../schemas/UserSchema");

const router = express.Router();

router.get("/", async (req, res, next) => {
    var payload = createPayload(req.session.user);

    res.status(200).render("searchPage", payload);
})

router.get("/:selectedTab", async (req, res, next) => {
    var payload = createPayload(req.session.user);
    payload.selectedTab = req.params.selectedTab;
    res.status(200).render("searchPage", payload);
})

function createPayload(user){
    return {
        pageTitle : "Search",
        userLoggedIn : user,
        userLoggedInJS : JSON.stringify(user),
        selectedTab : "users"
    }
}


module.exports = router;