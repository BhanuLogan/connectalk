const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName : { type : String, required : true, trim : true},
    lastName : { type : String, required : true, trim : true},
    username : { type : String, required : true, trim : true, unique : true},
    email : { type : String, required : true, trim : true, unique : true},
    password : { type : String, required : true, minLength : 8 },
    profilePic : { type : String, default : "/images/profilePic.png" },
    coverPhoto : { type : String },
    likes : [{ type : Schema.Types.ObjectId, ref : 'Post'}],
    retweets : [{ type : Schema.Types.ObjectId, ref : 'Post'}],
    followers : [{ type : Schema.Types.ObjectId, ref : 'User'}],
    following : [{ type : Schema.Types.ObjectId, ref : 'User'}],
    online: String
}, { timestamps : true });

const User = mongoose.model("User", UserSchema);

module.exports = User;