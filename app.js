const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = 3003;
const middleware = require('./middleware')
const path = require("path");
const mongoose = require("./database");
const session = require("express-session");

const server = app.listen(port, () => console.log("Server listening on port " + port));

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret : "Bhanu kumar",
    resave : true,
    saveUninitialized : false
}))
//Routes
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
const logoutRoute = require("./routes/logoutRoutes");
const posts = require("./routes/api/posts");
const postRoute = require("./routes/postRoutes");
const profileRoute = require("./routes/profileRoutes");
const users = require("./routes/api/users");
const uploadRoute = require("./routes/uploadRoutes");
const searchRoute = require("./routes/searchRoutes");


app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/api/posts", posts);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/api/users", users);
app.use("/uploads", uploadRoute);
app.use("/search", searchRoute);


app.get("/", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Home",
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user)
    }

    res.status(200).render("home", payload);
})