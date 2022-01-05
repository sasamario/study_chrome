var timeCount = 0;
var timeCountFlg = false;
var bgIntervalId = "";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    
    if (request.text == "check") {
        if (timeCountFlg) {
            sendResponse({ text: "done" });
        } else {
            // カウント処理が動いていない場合は、一度だけ現在のカウント分を画面に反映させる
            sendResponse({ text: "reflect" });
        }
    } else if (request.text == "start") {
        //タイムカウントが行われていない場合のみ、カウント処理を実行する
        if (!timeCountFlg) {
            timeCountFlg = true;
            timeCountUp();
            sendResponse({ text: "start" });
        } else {
            sendResponse({ text: "already started" });
        }
    }else if (request.text == "stop") {
        timeCountFlg = false;
        clearInterval(bgIntervalId);
    } else if (request.text == "reset") {
        timeCount = 0;
    }
    sendResponse();
    return true;
});


function timeCountUp() {
    //intervalIdはsetIntervalのid
    bgIntervalId = setInterval(function(){
        timeCount++;
    }, 1000);
}