$(function() {
    var count = 0;
    $(".save").on("click", function() {
        chrome.storage.local.set({"text": $("#tweet_textarea").val()}, function(){});
    });
    $(".temp").on("click", function() {
        chrome.storage.local.get("text", function(result) {
            $("#tweet_textarea").val(result.text);
            count = $("#tweet_textarea").val().length;
            $(".count").text(count);
        });
    });
    //TODO:現状だとひらがなも1文字換算だが、Twitterではバイト数で判断しているため要修正
    //ちなみにTwitterでは、全角140文字上限らしい（半角なら280字）
    $("#tweet_textarea").keyup(function() {
        count = $("#tweet_textarea").val().length;
        $(".count").text(count);
    });
    //コピー機能　ただし、execCommandは非推奨らしいので別方法で実装した方がよいかも？
    $(".copy").on("click", function() {
        $("#tweet_textarea").select();
        document.execCommand("copy");
    });
});