

chrome.tabs.onUpdated.addListener(
    async function(tabId, changeInfo, tab){
        if (!changeInfo.url){

        } else if ((changeInfo.url).includes("twitch.tv")){
            chrome.tabs.sendMessage( tabId, {
                message: "update channel",
                url: changeInfo.url,
            });
            console.log("sent");
        } else if ((changeInfo.url).includes("#access_token")){
            let token = (changeInfo.url).match(/(?<=access_token=)\w+/)[0];
            chrome.storage.local.set({access_token: token});
            chrome.tabs.remove(tabId);
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
