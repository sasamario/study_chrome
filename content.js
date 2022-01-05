$(function() {
    let background = chrome.extension.getBackgroundPage();
    let intervalId = "";
    let bgTimeCount = 0;

    //拡張機能起動時のカウントチェック
    chrome.runtime.sendMessage({text: "check"}, function(response) {
        if (response.text == "done") {
            //裏側で動いている場合は、表示部分に反映させる
            reflectTimeCount();
            intervalId = setInterval(function(){
                reflectTimeCount();
            }, 1000);
        } else {
            reflectTimeCount();
        }
    });

    $("#save").on("click", function() {
        chrome.storage.local.set({"text": $("#tweet_textarea").val()}, function(){});
    });
    $("#temp").on("click", function() {
        chrome.storage.local.get("text", function(result) {
            $("#tweet_textarea").val(result.text);
            reflectTimeCount();
        });
    });
    
    //URLは、一律文字数が23としてカウントされるとのこと（keyupが終わった後、再度文字数を再計算する必要がある？）
    $("#tweet_textarea").keyup(function() {
        reflectCount();
    });

    // 途中内容の自動保存処理
    $("#tweet_textarea").blur(function(){
        chrome.storage.local.set({"restore": $("#tweet_textarea").val()}, function(){});
    });

    //復元処理
    $("#restore").on("click", function(){
        chrome.storage.local.get("restore", function(result) {
            $("#tweet_textarea").val(result.restore);
            reflectCount();
        });
    });

    //カウントアップ開始処理
    $("#start").on("click", function(){
        chrome.runtime.sendMessage({text: "start"}, function(response) {
            //カウント反映処理を重複させないように、スタート時のみ以下の反映処理を実行する
            if (response.text == "start") {
                intervalId = setInterval(function(){
                    reflectTimeCount();
                }, 1000);
            }
        });
    });

    //カウントアップ停止処理
    $("#stop").on("click", function() {
        clearInterval(intervalId);
        chrome.runtime.sendMessage({text: "stop"}, function() {});
    });

    //カウントアップ値リセット処理
    $("#reset").on("click", function() {
        chrome.runtime.sendMessage({text: "reset"}, function() {});
        $(".time").text("00:00");
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

    

    /**
     * カウントアップ
     */
    function reflectTimeCount() {
        let min = 0;
        let sec = 0;
        let limit = 60 * 60 * 5;

        bgTimeCount = background.timeCount;

        if (bgTimeCount >= limit) {
            //自動停止
            chrome.runtime.sendMessage({text: "stop"}, function() {});
            clearInterval(intervalId);
            alert("5時間経過したため、自動停止しました");
        }

        min = String(Math.floor(bgTimeCount / 60));
        sec = String(bgTimeCount - min*60);
        sec = sec.length == 1 ? `0${sec}` : sec;
        min = min.length == 1 ? `0${min}` : min;
        
        let timer = `${min}:${sec}`;

        $(".time").text(timer);
    }
    
});