const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3003;
const middleware = require('./middleware');
const path = require("path");
const mongoose = require("./database");
const session = require("express-session");

const server = app.listen(port, () => console.log("Server listening on port " + port));
const io = require("socket.io")(server, { pingTimeout : 60000 });

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
const messagesRoute = require("./routes/messagesRoutes");
const chatsRoute = require("./routes/api/chats");
const messages = require("./routes/api/messages");
const notificationsRoute = require("./routes/notificationsRoute");
const notificationsApiRoute = require("./routes/api/notifications");
const { updateOnlineStatus } = require("./routes/utils/utils");


app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/api/posts",middleware.requireLogin, posts);
app.use("/api/chats", middleware.requireLogin, chatsRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/api/users", users);
app.use("/api/messages", middleware.requireLogin, messages);
app.use("/uploads", middleware.requireLogin, uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/api/notifications", notificationsApiRoute);


app.get("/", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Home",
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user)
    }

    res.status(200).render("home", payload);
})

io.on("connection", (socket) => {

    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.id = userData._id;
        socket.emit("connected");
    })
    socket.on("status updated", userData => {
        socket.broadcast.emit("update online users", userData._id);
    });
    socket.on("join room", room => { 
        socket.join(room);
    });
    socket.on("typing", data => {
        socket.in(data.user._id).emit("typing", { chatId: data.chatId, name: data.name });
    });
    socket.on("stop typing", data => {
        socket.in(data.otherUserId).emit("stop typing", data.chatId);
    });
    socket.on("notification received", room => socket.in(room).emit("notification received"));
    socket.on("unfollow", room => {
        socket.in(room).emit("unfollow")
    });
    socket.on("new message", newMessage => {
        var chat = newMessage.chat;
        if(!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {
            if(user._id == newMessage.sender._id) return ;
            socket.in(user._id).emit("message received", newMessage);
        });
    });
    socket.on("disconnect", async () => {
        var user = await updateOnlineStatus(socket.id, { online : "" });
        socket.broadcast.emit("disconnected", socket.id);
    });
});

