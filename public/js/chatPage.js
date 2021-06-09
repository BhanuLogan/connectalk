var typing = false;
var lastTypingTime;
var chat;
var otherUserId;
$(document).ready(() => {
    socket.emit("join room", chatId);

    refreshChatTitleBar();

    $.get(`/api/chats/${chatId}/messages`, (data) => {
        var messages = [];
        var lastSenderId = "";
        var prevMessageDate = null;
        
        data.forEach((message, index) => {
            if(prevMessageDate == null || !sameDay(message.createdAt, prevMessageDate)){
                var messageDateHtml = getMessageDateHtml(message.createdAt);
                messages.push(messageDateHtml);
            }
            var html = createMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);
            lastSenderId = message.sender._id;
            messageId = message._id;
            prevMessageDate = message.createdAt;
        })
        var messagesHtml = messages.join("");
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);
        markAllMessagesAsRead();
    });
});
function getMessageDateHtml(date){
    date = new Date(date);
    var dat = date.getDate();
    var month = getMonth(date.getMonth());
    var year = date.getFullYear();
    return `<div class='chatDate'>
            <span>${dat} ${month} ${year}</span>
        </div>`
}
function sameDay(curDate, prevDate){
    curDate = new Date(curDate);
    prevDate = new Date(prevDate);
    if(curDate.getDay() != prevDate.getDay())
        return false;
    if(curDate.getMonth() != prevDate.getMonth())
        return false;
    if(curDate.getFullYear() != prevDate.getFullYear())
        return false;
    return true;
}

function refreshChatTitleBar(){
    $.get(`/api/chats/${chatId}`, (data) =>{ 
        chat = data;
        $("#chatName").text(getChatName(data));
        var onlineStatus = getOnlineStatus(data.users);
        $("#typing").text(onlineStatus);
    });
}
function getOnlineStatus(users){
    if(users.length > 2) return "";
    users = users.filter(user => user._id != userLoggedIn._id);
    otherUserId = users[0]._id;
    return users[0].online != "Online" ? getLastSeen(users[0]) : "Online";
}
function getLastSeen(user){
    var timestamp = user.online * 1;
    var datetime = new Date(timestamp);
    var lastSeen = "last seen at ";
    var hours = datetime.getHours();
    var minutes = datetime.getMinutes();
    var date = datetime.getDate();
    var dateStr = "";
    if(date % 10 == 1)
        dateStr = date + "st";
    else if(date % 10 == 2)
        dateStr = date + "nd";
    else if(date % 10 == 3)
        dateStr = date + "rd";
    else 
        dateStr = date + "th";
    var month = datetime.getMonth();
    var year = datetime.getFullYear();
    var session = getSession(hours);
    hours -= hours > 12 ? 12 : 0;
    lastSeen += (hours == 0 ? "00" : hours) + ":" + (minutes < 10 ? '0' : "") + minutes  + session;
    lastSeen += " on " + dateStr + " " + getMonth(month) + " " + year;
    return lastSeen;
}
function getMonth(month){
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month];
}
function getSession(hours){
    var session = " AM";
    if(hours >= 12){
       session = " PM"; 
    }
    return session;
}
$("#chatNameButton").click(() => {
    var name = $("#chatNameTextBox").val().trim();

    $.ajax({
        url: "/api/chats/" + chatId,
        type: "PUT",
        data: { chatName : name},
        success : (data, status, xhr) => {
            if(xhr.status != 204){
                alert("could not update");
            }else{
                $("#chatName").text(name);
                location.reload();
            }
        }
    });
})

$(".inputTextBox").keydown(event => {
    updateTyping();
    if(event.which === 13){
        messageSubmitted();
        return false;
    } 
})
function updateTyping(){
    if(!connected) return ;
    if(!typing){
        typing = true;
        if(chat){
            chat.users.forEach(user => {
                if(user._id == userLoggedIn._id) return ;
                socket.emit("typing", { user, chatId, name: userLoggedIn.firstName });
            });
        }
    }
    lastTypingTime = new Date().getTime();
    var timerLength = 2000;
    setTimeout(() => {
        var diff = new Date().getTime() - lastTypingTime;
        if(diff >= timerLength && typing){
            emitStopTypingEvent();
            typing = false;
        }
    }, timerLength);
}
function emitStopTypingEvent(){
    if(chat){
        chat.users.forEach(user => {
            if(user._id == userLoggedIn._id) return ;
            socket.emit("stop typing", { otherUserId: user._id, chatId });
        });
    }
}
$(".sendMessageButton").click(() => {
    messageSubmitted();
})

function messageSubmitted(){
    let content = $(".inputTextBox").val().trim();
    if(content != ""){
        sendMessage(content);
        emitStopTypingEvent();
        $(".inputTextBox").val("");
        typing = false;
    }
}

function sendMessage(content){
    $.post("/api/messages/", { content, chatId }, (data, status, xhr) => {
        if(xhr.status != 201){
            alert("could not send message");
            $(".inputTextBox").val(content);
            return ;     
        }
        addChatMessageHtml(data);
        markAllMessagesAsRead();
        if(connected){
            socket.emit("new message", data);
        }
    })
}

function addMessagesHtmlToPage(html){
    $(".chatMessages").append(html);
}
function addChatMessageHtml(message){
    if(!message || !message._id){
        alert("Message is not valid");
        return ;
    }
    var messageDiv = createMessageHtml(message, null, "");
    addMessagesHtmlToPage(messageDiv);
    scrollToBottom(true);

}

function createMessageHtml(message, nextMessage, lastSenderId){
    var sender = message.sender;
    var senderName = sender.firstName + " " + sender.lastName;

    var currentSenderId = message.sender._id;
    var nextSenderId = nextMessage != null ? nextMessage.sender._id : "";
    
    var isFirst = lastSenderId != currentSenderId;
    var isLast = nextSenderId != currentSenderId;

    var isMine = message.sender._id == userLoggedIn._id;
    
    var liClassName = isMine ? "mine" : "theirs";
    var nameElement = "";
    if(isFirst){ 
        liClassName += " first";
        if(!isMine){
            nameElement += `<span class='senderName'>${senderName}</span>`;
        }
    }
    var profileImage = "";
    if(isLast){ 
       liClassName += " last";
       profileImage += `<img src='${sender.profilePic}'>`;
    }
    var imageContainer = "";
    if(!isMine) {
        imageContainer += `<div class='imageContainer'>
                            ${profileImage}
                        </div>`
    }
    var timestamp = getMessageTime(message.createdAt);
    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                        <span class='messageTime'>
                            ${timestamp}
                        </span>
                    </span>
                </div>
            </li>`
}
function getMessageTime(timestamp){
    date = new Date(timestamp);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var session = getSession(hours);
    if(hours > 12)
        hours -= 12;
    return (hours == 0 ? "00" : hours) + ":" + (minutes < 10 ? '0' : "") + minutes  + session;
}
function scrollToBottom(animated){
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;
    if(animated){
        container.animate({ scrollTop : scrollHeight }, "slow");
    }else{
        container.scrollTop(scrollHeight);
    }
}
function markAllMessagesAsRead(){
    $.ajax({
        url : `/api/chats/${chatId}/messages/markAsRead`,
        type: "PUT",
        success: () => refreshMessagesBadge()
    })
}