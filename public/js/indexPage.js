$(document).ready(() => {
    getChatList();
});

function outputChatList(chatList, container){
    chatList.forEach(chat => {
        var html = createChatHtml(chat);
        container.append(html);
    })
    if(chatList.length == 0){
        container.append("<span class='noResults'>Nothing to show</span>");
    }
}

