$(document).ready(() => {
    refreshFollowersAndFollowing();
    if(selectedTab == "replies"){
        loadReplies();
    }else
        loadPosts();
});
function refreshFollowersAndFollowing(){
    $.get(`/api/users/${profileUserId}/followers`, (results) => {
        var followers = results.followers == undefined ? 0 : results.followers.length;
        var following = results.following == undefined ? 0 : results.following.length;
        $("#followersValue").text(followers);
        $("#followingValue").text(following);
        
    });
}
function loadPosts(){
    $.get("/api/posts", { postedBy : profileUserId, pinned : true }, results => {
        outputPinnedPosts(results, $(".pinnedPostContainer"));    
    });
    $.get("/api/posts", { postedBy : profileUserId, isReply: false }, results => {
        outputPosts(results, $(".postsContainer"));
        
    });
}
function loadReplies(){
    $.get("/api/posts", { postedBy : profileUserId, isReply: true }, results => {
        outputPosts(results, $(".postsContainer"));
    });
}

function outputPinnedPosts(results, container){
    if(results.length == 0){
        container.hide();
        return ;
    }
    container.html("");

    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html); 
    })
}