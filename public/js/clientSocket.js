var connected = false;

var socket = io();
socket.emit("setup", userLoggedIn);

socket.on("connected", () =>{ 
    connected = true;
    updateOnlineStatus();
});
socket.on("typing", (data) => {
    if($(`[data-room="${data.chatId}"]`).length > 0)
        $("#typing").text(`${data.name} is typing...`);
});
socket.on("stop typing", (chatId) => {
    if($(`[data-room="${chatId}"]`).length > 0)
        refreshChatTitleBar();
});

socket.on("update online users", (userId) => {
    console.log("tererere");
    if($("#home").length > 0 || $("#chatListPage").length > 0){
        if(userLoggedIn.following && userLoggedIn.following.includes(userId))
            refreshOnlineUsers();
    }else if($("#chatPage").length > 0){
        if(userId == otherUserId)
            $("#typing").text("Online");
    }
});
socket.on("disconnected", (userId) => {
    if(userLoggedIn.following && userLoggedIn.following.includes(userId) && 
    ($("#home").length > 0 || $("#chatListPage").length > 0)){
        refreshOnlineUsers();
    }else if($("#chatPage").length > 0){
        if(userId == otherUserId)
            refreshChatTitleBar();
    }
});

function updateOnlineStatus(){
    var data = "Online";
    $.ajax({
        url : `/api/users/${userLoggedIn._id}/updateOnlineStatus`,
        type: "PUT",
        data: { online: data },
        success: (user) => socket.emit("status updated", user)
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