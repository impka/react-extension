const nick = "react-extension-lol";
const re = /[A-Za-z0-9_]+/g;
const youtubeRe = /https:\/\/youtu.be\/.+/;

let reResult;
let currentMessageUser = "";
let oAuth;
let socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
let channels = new Map();
const ytUrls = new Map();

//Join twitch IRC when web socket is created
socket.addEventListener('open', async () => {
    oAuth = (await chrome.storage.sync.get(['access_token'])).access_token;
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    //socket.send(`JOIN #${channel}`);
})

//read IRC messages 
socket.addEventListener('message', event => {
    console.log(event.data);
    if(event.data.includes("PING")){
        socket.send("PONG");
        console.log("sent pong")
    } else {
        currentMessageUser = event.data.match(/[A-Za-z0-9_]+/)[0];
        if(MapHasItem(channels, currentMessageUser)){
            console.log("PASSED CHANNEL OWNER CHECK");
            let link;
            if(event.data.match(youtubeRe)){
                link = event.data.match(youtubeRe)[0];
            }
            // create new youtube tab with link 
            console.log(link);
            if(link && !MapHasItem(ytUrls, link) && link.includes("youtu")){
                console.log("PASSED YOUTUBE LINK CHECK");
                chrome.tabs.create(
                {
                    active: false,
                    url: link + ";autoplay=1",
                }, 
                function(tab){
                    ytUrls.set(tab.id, link);
                    console.log(ytUrls.size);
                }) 
            }
        }
    }
})

//On tab creation, check if its a twitch tab, if so, join IRC channel
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab){ 
         if (changeInfo.url && (changeInfo.url).includes("twitch.tv")){
            //leave old channel if it exists
            if(channels.get(tabId)){
                socket.send(`PART #${channels.get(tabId)}`);
            }
            //change url in urls array and join news
            reResult = changeInfo.url.match(re);
            channels.set(tabId, reResult[reResult.length-1]);
            socket.send(`JOIN #${channels.get(tabId)}`);
            console.log(channels.size);
        } else if (changeInfo.url && (changeInfo.url).includes("#access_token")){
            // if url has access token grab token
            let token = (changeInfo.url).match(/(?<=access_token=)\w+/)[0];
            chrome.storage.sync.set({access_token: token});
            chrome.tabs.remove(tabId);
        }
})

//On tab removal, check if its a twitch tab, if so, leave IRC channel
chrome.tabs.onRemoved.addListener(
    function (tabId){
        if(channels.get(tabId)){
            socket.send(`PART #${channels.get(tabId)}`);
            channels.delete(tabId);
            console.log(channels.size);
        } else if(ytUrls.get(tabId)){
            ytUrls.delete(tabId);
            console.log(ytUrls.size);
        }
    }
)

function MapHasItem(map, item){
    for(const element of map){
        console.log(element);
        if(element[1] == item){
            console.log("Match Found");
            return true;
        }
    }
    return false;
}

// EXTENSION INSTALL OPEN PAGE STUFF

chrome.runtime.onInstalled.addListener(function(object){
    chrome.tabs.create({url: chrome.extension.getURL('setup.html')})
})