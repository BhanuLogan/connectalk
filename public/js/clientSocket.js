var connected = false;

var socket = io("http://localhost:3003");
socket.emit("setup", userLoggedIn);

socket.on("connected", () =>{ 
    connected = true;
});
socket.on("typing", () => $("#typing").text("typing..."));
socket.on("stop typing", () => $("#typing").text(""));
socket.on("message received", newMessage => messageReceived(newMessage));

socket.on("notification received", () => {
    $.get("/api/notifications/latest", newNotification => {
        var isInNotificationPage = $("#notificationPage").length > 0;
        console.log("Note : " + isInNotificationPage);
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