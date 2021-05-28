$(document).ready(() => {
    socket.emit("join room", chatId);
    $.get(`/api/chats/${chatId}`, (data) => $("#chatName").text(getChatName(data)));
    $.get(`/api/chats/${chatId}/messages`, (data) => {
        var messages = [];
        var lastSenderId = "";
        data.forEach((message, index) => {
            var html = createMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);
            lastSenderId = message.sender._id;
        })
        var messagesHtml = messages.join("");
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);
    });
});

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
    socket.emit("typing", chatId);
}
$(".sendMessageButton").click(() => {
    messageSubmitted();
})

function messageSubmitted(){
    let content = $(".inputTextBox").val().trim();
    if(content != ""){
        sendMessage(content);
        $(".inputTextBox").val("");
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
        scrollToBottom(true);
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
    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`
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