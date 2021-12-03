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
            checkUrl(string);
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

    //入力値のカウント数取得処理　全角2文字　半角1文字
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

    /**
     * 文字列内にURL形式が含まれているかチェックし、その結果を返す
     * @param {String} string 
     * @return {Array|null} URL形式の文字列が含まれているかの結果 TODO:この書き方であっているのか要確認
     */
    function checkUrl(string) {
        let regex = /(https):\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+/g;
        let result = string.match(regex);

        //debug
        console.log(result);
        console.log(result.length);
        return result;
    }
});