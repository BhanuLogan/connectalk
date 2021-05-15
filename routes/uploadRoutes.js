const express = require('express');
const app = express();
const User = require("../schemas/UserSchema");
const path = require("path");
const router = express.Router();

router.get("/images/:path", async (req, res, next) => {
    return res.sendFile(path.join(__dirname, `../uploads/images/${req.params.path}`))
})

module.exports = router;