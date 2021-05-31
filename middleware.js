exports.requireLogin = (req,res,next) => {
    if(req.session && req.session.use) {
        return next();
    }
    else {
        return res.redirect("/login")
    }
}