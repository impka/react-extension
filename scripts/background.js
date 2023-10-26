const nick = "react-extension";
const re = /[A-Za-z0-9_]+/g;
const youtubeRe = /https:\/\/youtu.be\/.+/;

let reResult;
let channel = null;
let currentMessageUser = "";
let oAuth = '';
const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

chrome.tabs.onUpdated.addListener(
    async function(tabId, changeInfo, tab){
        if (!changeInfo.url){

        } else if ((changeInfo.url).includes("twitch.tv")){
            chrome.tabs.sendMessage( tabId, {
                message: "update channel",
                url: changeInfo.url, // TO DO: CHANGE THIS SHIT SO IT LEAVES WHEN TWITCH TAB CLOSES, JOINS WHEN TWITCH TAB OPENS YOU BIG FAT DUMB FUCK
            });
            reResult = changeInfo.url.match(re);
            channel = reResult[reResult.length-1];
            socket.send(`JOIN #${channel}`);
        } else if ((changeInfo.url).includes("#access_token")){
            let token = (changeInfo.url).match(/(?<=access_token=)\w+/)[0];
            chrome.storage.sync.set({access_token: token});
            chrome.tabs.remove(tabId);
        }
})

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse){
        if(request.message == "open youtube link"){
            console.log(request.url);
            chrome.tabs.create({
                active: false,
                url: request.url,
            })
        } else if(request.message == 'oAuth token request'){
            console.log("IM HERE");
            let token = (await chrome.storage.sync.get(['access_token'])).access_token
            console.log(token);
            sendResponse({
                access_token: token
            })
            return true;
        }
    }
)

