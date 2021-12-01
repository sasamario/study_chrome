$(function() {
    $(".save").on("click", function() {
        chrome.storage.local.set({"text": $("#tweet_textarea").val()}, function(){});
    });
    $(".temp").on("click", function() {
        chrome.storage.local.get("text", function(result) {
            $("#tweet_textarea").val(result.text);
            let string = $("#tweet_textarea").val();
            let count = getStringCount(string);
            $(".count").text(count);
        });
    });
    
    //URLは、一律文字数が23としてカウントされるとのこと（keyupが終わった後、再度文字数を再計算する必要がある？）
    $("#tweet_textarea").keyup(function() {
        let string = $("#tweet_textarea").val();
        let count = getStringCount(string);
        
        $(".count").text(count);
    });
    //コピー機能　ただし、execCommandは非推奨らしいので別方法で実装した方がよいかも？
    $(".copy").on("click", function() {
        $("#tweet_textarea").select();
        document.execCommand("copy");
    });

    function getStringCount(string) {
        let count = 0;
        for (let i = 0; i < string.length; i++) {
            if (string.charAt(i).match(/^[^\x01-\x7E\xA1-\xDF]+$/)) {
                count += 2;
            } else {
                count ++;
            }
        }
        return count;
    }
});