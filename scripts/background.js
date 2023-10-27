const nick = "react-extension";
const re = /[A-Za-z0-9_]+/g;
const youtubeRe = /https:\/\/youtu.be\/.+/;

let reResult;
let channel = null;
let currentMessageUser = "";
let oAuth = (await chrome.storage.sync.get(['access_token'])).access_token;
const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

//Join twitch IRC when web socket is created
socket.addEventListener('open', () => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN #${channel}`);
})

//read IRC messages 
socket.addEventListener('message', event => {
    console.log(event.data);
    if(event.data.includes("PING")){
        socket.send("PONG");
    } else {
        currentMessageUser = event.data.match(/[A-Za-z0-9_]+/)[0];
        console.log(event.data);
        if(currentMessageUser == channel){
            let link;
            if(event.data.match(youtubeRe)){
                link = event.data.match(youtubeRe)[0] + ";autoplay=1";
                console.log(link);
            }
            /* old logic to send message to open yt link to content js
            chrome.runtime.sendMessage({
                message: "open youtube link",
                url: link,
            })
            */
            chrome.tabs.create({
                active: false,
                url: link,
            })
        }
    }
})

//On tab creation, check if its a twitch tab, if so, join IRC channel
chrome.tabs.onCreated.addListener(
    async function(tabId, changeInfo, tab){
        if (!changeInfo.url){

        } else if ((changeInfo.url).includes("twitch.tv")){
            /* old logic to send message to content js to update channel
            chrome.tabs.sendMessage( tabId, {
                message: "update channel",
                url: changeInfo.url, // TO DO: CHANGE THIS SHIT SO IT LEAVES WHEN TWITCH TAB CLOSES, JOINS WHEN TWITCH TAB OPENS YOU BIG FAT DUMB FUCK
            });
            */
            reResult = changeInfo.url.match(re);
            channel = reResult[reResult.length-1];
            socket.send(`JOIN #${channel}`);
        } else if ((changeInfo.url).includes("#access_token")){
            let token = (changeInfo.url).match(/(?<=access_token=)\w+/)[0];
            chrome.storage.sync.set({access_token: token});
            chrome.tabs.remove(tabId);
        }
})

//On tab removal, check if its a twitch tab, if so, leave IRC channel
chrome.tabs.onRemoved.addListener(
    function (tabId, changeInfo, tab){
        if(!changeInfo.url){

        } else if((changeInfo.url).includes("twitch.tv")){
            reResult = changeInfo.url.match(re);
            channel = reResult[reResult.length-1];
            socket.send(`PART #${channel}`);
        }
    }
)


/* OLD LOGIC FOR sending messages between content js and background
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
*/