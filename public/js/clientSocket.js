var connected = false;

var socket = io();
socket.emit("setup", userLoggedIn);

socket.on("connected", () =>{ 
    connected = true;
    updateOnlineStatus();
});
socket.on("update online users", () => {
    
    if($("#home").length > 0 || $("#chatListPage").length > 0)
        refreshOnlineUsers();
});
socket.on("disconnected", (userId) => {
    if(userLoggedIn.followers && userLoggedIn.followers.includes(userId) && 
    ($("#home").length > 0 || $("#chatListPage").length > 0)){
        refreshOnlineUsers();
    }
});

function updateOnlineStatus(){
    var data = "Online";
    $.ajax({
        url : `/api/users/${userLoggedIn._id}/updateOnlineStatus`,
        type: "PUT",
        data: { online: data },
        success : (user) => socket.emit("status updated", user)
    })
}


socket.on("message received", newMessage => messageReceived(newMessage));
socket.on("unfollow", () => {
    if($("#profilePage").length > 0)
        refreshFollowersAndFollowing();
})
socket.on("notification received", () => {
    $.get("/api/notifications/latest", newNotification => {
        var isInNotificationPage = $("#notificationPage").length > 0;
        if(newNotification.notificationType == 'follow'){
            userLoggedIn.followers.push(newNotification.userFrom);
            if($("#profilePage").length > 0)
                refreshFollowersAndFollowing();
        }
        if(isInNotificationPage){
            var html = createNotificationHtml(newNotification);
            $(".resultsContainer").prepend(html);
        }else{
            showNotificationPopup(newNotification);
        }
        refreshNotificationsBadge();
    })
});

function emitNotification(userId){
    if(userId == userLoggedIn._id) return ;
    socket.emit("notification received", userId);
}