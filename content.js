$(function() {
    $(".save").on("click", function() {
        chrome.storage.local.set({"text": $("#tweet_textarea").val()}, function(){});
    });
    $(".temp").on("click", function() {
        chrome.storage.local.get("text", function(result) {
            $("#tweet_textarea").val(result.text);
            reflectCount();
        });
    });
    
    //URLは、一律文字数が23としてカウントされるとのこと（keyupが終わった後、再度文字数を再計算する必要がある？）
    $("#tweet_textarea").keyup(function() {
        reflectCount();
    });

    //コピー機能　ただし、execCommandは非推奨らしいので別方法で実装した方がよいかも？
    $(".copy").on("click", function() {
        $("#tweet_textarea").select();
        document.execCommand("copy");
    });

    //途中内容の自動保存処理
    $("#tweet_textarea").blur(function(){
        chrome.storage.local.set({"restore": $("#tweet_textarea").val()}, function(){});
    });

    //復元処理
    $(".restore").on("click", function(){
        chrome.storage.local.get("restore", function(result) {
            $("#tweet_textarea").val(result.restore);
            reflectCount();
        });
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
     * @returns {Array|null} URL形式の文字列が含まれているかの結果
     */
    function checkUrl(string) {
        let regex = /(https):\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+/g;
        let result = string.match(regex);

        return result;
    }

    /**
     * カウント数の差分を求める処理（URLは一律23文字として扱うため）
     * @param {Array} urlArray 
     * @returns {Number} 差分のカウント数
     */
    function getDifferenceCount(urlArray = []) {
        let urlDifferenceCount = 0;
        const twitterUrlLength = 23;
        urlArray.forEach(function(url){
            urlDifferenceCount += url.length - twitterUrlLength;
        });
        return urlDifferenceCount;
    }

    /**
     * カウント数を調整する処理（URLは一律23文字として扱うため）
     * @param {String} string 
     * @param {Number} count 
     * @returns {Number} 調整後のカウント数
     */
    function addjustCount(string, count) {
        let urlDifferenceCount = 0;
        let checkResult = checkUrl(string);
        //文字列にURL形式のものがある場合のみ差分のカウント数を求める
        if (checkResult != null) {
            urlDifferenceCount = getDifferenceCount(checkResult);
        }
        let formalCount = count - urlDifferenceCount;

        return formalCount;
    }

    /**
     * カウント数を反映させる処理
     */
    function reflectCount() {
        const limitCount = 280;
        let string = $("#tweet_textarea").val();
        let count = getStringCount(string);
        let formalCount = addjustCount(string, count);
        $(".count").text(formalCount);

        //規定の文字数を超えている場合、カウント数を赤色に変更する
        if (formalCount > limitCount) {
            $(".count").css("color", "red");
        } else {
            $(".count").css("color", "#fff");
        }
    }
});