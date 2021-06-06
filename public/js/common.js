let cropper;
var timer;
var selectedUsers = [];

$(document).ready(() => {
    refreshMessagesBadge();
    refreshNotificationsBadge();
})
$("#postTextArea, #replyTextArea").keyup(event => {
    let text = $(event.target);
    let value = text.val().trim();
    let isModal = text.parents(".modal").length == 1;
    let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(value == ""){
        submitButton.prop("disabled", true);
        return ;
    }
    submitButton.prop("disabled", false);
});

$("#submitPostButton, #submitReplyButton").click(event => {
    let button = $(event.target);
    let isModal = button.parents(".modal").length == 1;
    let textbox = isModal ? $("#replyTextArea") : $("#postTextArea");

    let data = {
        content : textbox.val()
    }
    if(isModal) {
        let id = button.data().id;
        if(id == null) return alert("post id is null");
        data.replyTo = id;
    }
    $.post("/api/posts", data, (postData, status, xhr) => {
        if(postData.replyTo){
            $("#replyPostButton").prop("disabled", true);
            textbox.val("");
            emitNotification(postData.replyTo.postedBy);
            location.reload();
        }else{
            let html = createPostHtml(postData);
            $(".postContainer").prepend(html);
            $("#submitPostButton").prop("disabled", true);
            textbox.val("");
        }
    });
});

$("#userSearchTextBox").keydown(() => {
    clearTimeout(timer);

    var textBox = $(event.target);
    var value = textBox.val();
    if(value == "" && (event.keycode == 8 || event.which == 8)){
        selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");
        if(selectedUsers.length == 0){
            $("#createChatButton").prop("disabled", true);
        }
        return ;
    } 
 
    timer = setTimeout(() => {
        value = textBox.val().trim();
        if(value == ""){
            $(".resultsContainer").html("");
        }else{
            searchUsers(value);
        }
    }, 1000)    
});

$("#createChatButton").click(() => {
    const data = JSON.stringify(selectedUsers);
    var chatData = {
        users: data
    }
    $.post("/api/chats", chatData, chat => {
        if(!chat || !chat._id) return alert("Invalid response from server");
        window.location.href = `/messages/${chat._id}`;
    });
});
$(document).on("click", ".likeButton", () => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);
    $.ajax({
        url: `/api/posts/${postId}/like`,
        type : "PUT",
        success : (postData) => {
            button.find("span").text(postData.likes.length || "");
    
            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
                emitNotification(postData.postedBy);
            }else
                button.removeClass("active");
        }
    });
});

$("#replyModal").on("show.bs.modal", (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);
    $.get(`/api/posts/${postId}` , results => {
        outputPosts(results.postData, $("#originalPostContainer"));
    });
});

$("#deletePostModal").on("show.bs.modal", (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id", postId);
});

$("#confirmPinModal").on("show.bs.modal", (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $("#pinPostButton").data("id", postId);
});
$("#unpinModal").on("show.bs.modal", (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $("#unpinPostButton").data("id", postId);
});
$("#deletePostButton").click((event) => {
    let postId = $(event.target).data("id");
    $.ajax({
        url: `/api/posts/${postId}`,
        type : "DELETE",
        success : () => {
            location.reload();
        }
    });
});
$("#pinPostButton").click((event) => {
    let postId = $(event.target).data("id");
    $.ajax({
        url: `/api/posts/${postId}`,
        type : "PUT",
        data: { pinned : true },
        success : () => {
            location.reload();
        }
    });
});
$("#unpinPostButton").click((event) => {
    let postId = $(event.target).data("id");
    $.ajax({
        url: `/api/posts/${postId}`,
        type : "PUT",
        data: { pinned : false },
        success : () => {
            location.reload();
        }
    });
});

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

$("#filePhoto").change(function() {
    if(this.files && this.files[0]) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let image = document.getElementById("imagePreview");
            image.src = e.target.result;
            if(cropper !== undefined){
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRatio : 1/1,
                background : false
            })
        }
        reader.readAsDataURL(this.files[0]);
    }
});
$("#coverPhoto").change(function() {
    if(this.files && this.files[0]) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let image = document.getElementById("coverPreview");
            image.src = e.target.result;
            if(cropper !== undefined){
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRatio : 16/9,
                background : false
            })
        }
        reader.readAsDataURL(this.files[0]);
    }
});

$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null){
        alert("Could not upload image");
        return ;
    }
    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url : "/api/users/profilePicture",
            type : "POST",
            data : formData,
            processData : false,
            contentType : false,
            success : () => location.reload()
        });
    });
});

$("#coverPhotoUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null){
        alert("Could not upload image");
        return ;
    }
    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);
        $.ajax({
            url : "/api/users/coverPhoto",
            type : "POST",
            data : formData,
            processData : false,
            contentType : false,
            success : () => location.reload()
        });
    });
});

$(document).on("click", ".retweetButton", () => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);
    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type : "POST",
        success : (postData) => {
            
            button.find("span").text(postData.retweetUsers.length || "");
    
            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
                emitNotification(postData.postedBy);
            }else
                button.removeClass("active");
        }
    });
});
$(document).on("click", ".post", () => {
    let element = $(event.target);
    let postId = getPostIdFromElement(element);
    if(postId !== undefined && !element.is("button")){
        window.location.href = "/posts/" + postId;
    }
});
$(document).on("click", ".followButton", (e) => {
    let button = $(e.target);
    let userId = button.data().user;
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type : "PUT",
        success : (data, status, xhr) => {
            if(xhr.status == 404){
                alert("user not found");
                return ;
            }
            let difference = 1;
            if(data.following && data.following.includes(userId)){
                button.addClass("following");
                button.text("Following");
                emitNotification(userId);
            }else{
                socket.emit("unfollow", userId);
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }

            let followersLabel = $("#followersValue");
            if(followersLabel.length != 0){
                let followersText = followersLabel.text();
                followersText = parseInt(followersText);
                followersLabel.text(followersText + difference);
            }
        }
    });
});
$(document).on("click", ".notification.active", (e) => {
    var container = $(e.target);
    var notificationId = container.data().id;

    var href = container.attr("href");
    e.preventDefault();
    var callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
});
function getPostIdFromElement(element){
    let isRoot = element.hasClass(".post");
    let post = isRoot ? element : element.closest(".post");

    let postId = post.data().id;

    if(postId === undefined)
        return console.log("Post id is undefined");

    return postId;
}
function createPostHtml(postData, largeFont = false){
    if(postData == null) return alert("post is null");
    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;
    let postedBy = postData.postedBy;

    if(postedBy._id == undefined){
        return console.log("User object not populated");
    }
    let replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id){
            return alert("replyTo is not populated");
        }
        if(!postData.replyTo.postedBy._id){
            return alert("postedBy is not populated");
        }
        replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`
    }
    let name = postedBy.firstName + " " + postedBy.lastName;    
    let time = timeDifference(new Date(), new Date(postData.createdAt));

    let userLikedButtonActive = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    let userRetweetButtonActive = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    let largeFontClass = largeFont ? "largeFont" : "";
    let retweetText = '';
    if(isRetweet){
        retweetText = `<span>
                            <i class='fas fa-retweet'></i>
                            Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                        </span>`;
    }

    let deleteButton = "";
    let pinnedPostText = ""
    if(postData.postedBy._id == userLoggedIn._id){
        let pinnedClass = ""
        let pinText = "#confirmPinModal";
        if(postData.pinned){
            pinnedClass = "active";
            pinText = "#unpinModal";
            pinnedPostText = `<i class='fas fa-thumbtack'></i> <span>Pinned post</span>`;
        }
        deleteButton = `<button class='pinButton ${pinnedClass}' data-id=${postData._id} data-toggle='modal' data-target='${pinText}'>
                            <i class='fas fa-thumbtack'></i>
                        </button>
                        <button data-id=${postData._id} data-toggle='modal' data-target='#deletePostModal'>
                            <i class='fas fa-times'></i>
                        </button>`
    }

    return `<div class='post ${largeFontClass}' data-id=${postData._id}>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src=${postedBy.profilePic} />
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>${pinnedPostText}</div>

                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${name}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${time}</span>
                            ${deleteButton}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='fas fa-comment'></i>
                                </button>        
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${userRetweetButtonActive}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || "  "}</span>
                                </button>        
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${userLikedButtonActive}'>
                                    <i class='fas fa-heart'></i>
                                    <span>${postData.likes.length || "  "}</span>
                                </button>        
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return 'Just now';
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){
    container.html("");
    if(!Array.isArray(results)){
        results = [results];
    }
    results.forEach(result => {
        container.append(createPostHtml(result));
    })
    
    if(results.length == 0){
        container.append("<span class='noResults'>Nothing to show</span>");
    }
}

function outputPostsWithReplies(results, container){
    container.html("");
    if(results.replyTo !== undefined && results.replyTo._id !== undefined){
        container.append(createPostHtml(results.replyTo));
    }
    container.append(createPostHtml(results.postData, true));
    results.replies.forEach(result => {
        container.append(createPostHtml(result));
    })
    
    if(results.length == 0){
        container.append("<span class='noResults'>Nothing to show</span>");
    }
}
function outputUsers(results, container){
    container.html("");
    results.forEach(result => {
        var html = createUserHtml(result, true);
        container.append(html);
    });
    if(results.length == 0){
        container.append(`<span class='noResults'>No results</span>`)
    }
}

function createUserHtml(userData, showFollowButton){
    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id)
    var text = isFollowing ? "Following" : "Follow";
    var buttonClass = isFollowing ? "followButton following" : "followButton";

    var followButton = ""
    
    if(showFollowButton && userLoggedIn._id != userData._id){
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}' />
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`
}
function searchUsers(search){
    $.get("/api/users", { search }, results => {
        outputSelectableUsers(results, $(".resultsContainer"));     
    });
}
function outputSelectableUsers(results, container){
    container.html("");
    results.forEach(result => {
        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)){
            return ;
        }
        var html = createUserHtml(result, true);
        var element = $(html);
        element.click(() => userSelected(result));
        container.append(element);
    });
    if(results.length == 0){
        container.append(`<span class='noResults'>No results</span>`)
    }
}

function userSelected(user){
    selectedUsers.push(user);
    updateSelectedUsersHtml();
    $("#userSearchTextBox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
    let elements = [];
    selectedUsers.forEach(user => {
        var name = user.firstName + " " + user.lastName;
        var element = `<span class='selectedUser'>${name}</span>`;
        elements.push(element);
    });
    $(".selectedUser").remove();
    $("#selectedUsers").prepend(elements);
}
function getChatName(chatData){
    var chatName = chatData.chatName;
    if(!chatName){
        var otherChatUsers = getOtherChatUsers(chatData.users);
        var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        chatName = namesArray.join(", ");
    }
    return chatName;
}
function getOtherChatUsers(users){
    if(users.length == 1) return users;
    return users.filter(user => user._id != userLoggedIn._id);
}

function messageReceived(newMessage){
    if($(`[data-room="${newMessage.chat._id}"]`).length == 0){
        if($("#chatListPage").length > 0)
            getChatList();
        else
            showMessagePopup(newMessage);
    }else{
        markAllMessagesAsRead();
        addChatMessageHtml(newMessage);
    }
    refreshMessagesBadge();
}
function getChatList(){
    $.get("/api/chats", (data, status, xhr) => {
        if(xhr.status == 400){
            alert("Could not get chat list.");
        }else{
            $(".resultsContainer").html("");
            outputChatList(data, $(".resultsContainer"));
        }
    });
}

function markNotificationsAsOpened(notificationId = null, callback = null){
    if(callback == null) callback = () => location.reload();
    var url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : "/api/notifications/markAsOpened";
    
    $.ajax({
        url: url,
        type: "PUT",
        success: () => callback()
    });
}

function refreshMessagesBadge(){
    $.get("/api/chats", { unreadOnly : true }, (data) => {
        var numResults = data.length;
        if(numResults > 0){
            $("#messagesBadge").text(numResults).addClass("active");
        }else{
            $("#messagesBadge").text("").removeClass("active");
        }
    })
}
function refreshNotificationsBadge(){
    $.get("/api/notifications", { unreadOnly : true }, (data) => {
        data = data.filter(notification => notification.userFrom._id != userLoggedIn._id);
        var numResults = data.length;
        if(numResults > 0){
            $("#notificationsBadge").text(numResults).addClass("active");
        }else{
            $("#notificationsBadge").text("").removeClass("active");
        }
    })
}

function outputNotificationList(notifications, container){
    notifications.forEach(notification => {
        if(notification.userFrom._id == userLoggedIn._id) return ;
        var html = createNotificationHtml(notification);
        container.append(html);
    });
    if(notifications.length == 0){
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}
function createNotificationHtml(notification){
    var userFrom = notification.userFrom;
    var text = getNotificationText(notification);
    var href = getNotificationUrl(notification);
    var className = notification.opened ? "" : "active";
    return `<a href="${href}" class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getNotificationText(notification){
    var userFrom = notification.userFrom;
    if(!userFrom.firstName || !userFrom.lastName){
        return alert("userFrom data not populated");
    }
    var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    var text;
    if(notification.notificationType == 'retweet'){
        text = `${userFromName} retweeted one of your posts`;
    }else if(notification.notificationType == 'postLike'){
        text = `${userFromName} liked one of your posts`;
    }else if(notification.notificationType == 'reply'){
        text = `${userFromName} replied to one of your posts`;
    }else if(notification.notificationType == 'follow'){
        text = `${userFromName} started following you`;
    }
    return `<span class='ellipsis'>${text}</span>`
}
function getNotificationUrl(notification){
    var text;
    if(notification.notificationType == 'retweet' ||
    notification.notificationType == 'postLike' || 
    notification.notificationType == 'reply'){
        text = `/posts/${notification.entityType}`;
    }else if(notification.notificationType == 'follow'){
        text = `/profile/${notification.entityType}`;
    }
    return text;
}

function showNotificationPopup(notification){
    var html = createNotificationHtml(notification);
    var element = $(html);
    element.hide().prependTo($("#notificationList")).slideDown("fast");
    setTimeout(() =>{ 
        element.fadeOut(400)
    }, 5000);
}
function createChatHtml(chatData){
    var chatName = getChatName(chatData);
    var image = getChatImageElements(chatData);
    var latestMessage = getLatestMessage(chatData.latestMessage);

    var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";
    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
            ${image}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis'>${chatName}</span>
                <span class='subText ellipsis'>${latestMessage}</span>
            </div>
        </a>`;
}
function getLatestMessage(latestMessage){
    if(latestMessage != null){
        var sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }
    return "New chat";
}


function getChatImageElements(chatData){
    var otherChatUsers = getOtherChatUsers(chatData.users);
    var groupChatClass = "";
    var chatImage = getUserChatImageElement(otherChatUsers[0]);
    if(otherChatUsers.length > 1){
        groupChatClass = "groupChatImage"; 
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }
    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}
function getUserChatImageElement(user) {
    if(!user || !user.profilePic){
        return alert("User passed into function is invalid");
    }
    return `<img src='${user.profilePic}' alt='User's profile pic'>`;
}
function showMessagePopup(data){
    if(!data.chat.latestMessage._id){
        data.chat.latestMessage = data;
    }
    var html = createChatHtml(data.chat);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");
    setTimeout(() => element.fadeOut(400), 5000);
}
function refreshOnlineUsers(){
    $.get(`/api/users/${userLoggedIn._id}/following`, results => {
        results = results.following;
        console.log(results);
        results = results.filter(user => user.online == "Online");
        var container = $(".onlineUsers");
        var heading = "<div class='onlineHeading'> Online users </div>";
        container.html(heading);
        results.forEach(result => {
            var html = createOnlineUserHtml(result);
            container.append(html);
        });
        console.log(results);
        if(results.length == 0){
            container.append(`<span class='noResults'>No online users</span>`)
        }
    });
}
function createOnlineUserHtml(userData){
    var name = userData.firstName + " " + userData.lastName;
    

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}' />
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                    </div>
                    <div class='online'>
                        Online
                    </div>
                </div>
            </div>`
}