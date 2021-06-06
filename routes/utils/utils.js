const User = require("../../schemas/UserSchema");
const mongoose = require("mongoose");
async function updateOnlineStatus(userId, data){
    if(!mongoose.isValidObjectId(userId))
        return ;
    var user = await User.findById(userId);

    if(user == null) return res.sendStatus(404);

    if(data.online === ""){
        data.online = Date.now().toString();
    }
    
    return User.findByIdAndUpdate(userId, data, 
        {useFindAndModify : false}).populate("following");

}

module.exports = { updateOnlineStatus };