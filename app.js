const express = require("express");
const middleware = require("./middleware")
const app = express();
const path = require("path") 
const bodyParser = require("body-parser")
const db = require("./database");
const port = 3002;

// const db = new Database();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyParser.urlencoded({extended :false}));


app.use(express.static(path.join(__dirname,"public")));  
//Routes
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
app.use("/login",loginRoute);
app.use("/register",registerRoute);

app.get("/",middleware.requireLogin, (req,res,next) => {

    var payload = {
        pageTitle : "Home"
    }
    res.status(200).render("home",payload);
});

const server = app.listen(port, () => {
    console.log("listening on port  "+ port);
});