
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