var timer;
$(document).ready(() => {
    if(selectedTab == "posts")
        return ;
    var following = userLoggedIn.following == undefined ? [] : userLoggedIn.following;
    $.get("/api/users/", { following : userLoggedIn.following }, (results) => {
        outputUsers(results, $(".resultsContainer"));
    });  
});
$("#searchBox").keydown(() => {
    clearTimeout(timer);

    var textBox = $(event.target);
    var value = textBox.val();
    var searchType = textBox.data().search;

    timer = setTimeout(() => {
        value = textBox.val().trim();
        if(value == ""){
            $(".resultsContainer").html("");
        }else{
            search(value, searchType)
        }
    }, 1000)    
});

function search(searchTerm, searchType){
    let url = searchType == "users" ? "/api/users" : "/api/posts";
    $.get(url, { search : searchTerm }, (results) => {
        if(searchType == "users"){
            outputUsers(results, $(".resultsContainer"));
        }else { 
            outputPosts(results, $(".resultsContainer"));
        }
    })
}