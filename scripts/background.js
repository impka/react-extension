
chrome.tabs.onUpdated.addListener(
    function(tabID, changeInfo, tab){
        if (changeInfo.url && (changeInfo.url).includes("twitch.tv")){
            chrome.tabs.sendMessage( tabID, {
                message: "update channel",
                url: changeInfo.url,
            });
            console.log("sent");
        }
})

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.message == "open youtube link"){
            console.log(request.url);
            chrome.tabs.create({
                active: false,
                url: request.url,
            })
        }
    }
)
