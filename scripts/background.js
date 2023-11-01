const nick = "react-extension-lol";
const re = /[A-Za-z0-9_]+/g;
const youtubeRe = /https:\/\/youtu.be\/.+/;

let reResult;
let currentMessageUser = "";
let oAuth;
let socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
let channels = [];

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
    } else {
        currentMessageUser = event.data.match(/[A-Za-z0-9_]+/)[0];
        if(channels.includes(currentMessageUser)){
            let link;
            if(event.data.match(youtubeRe)){
                link = event.data.match(youtubeRe)[0] + ";autoplay=1";
                console.log(link);
            }
            // create new youtube tab with link
            chrome.tabs.create({
                active: false,
                url: link,
            })
        }
    }
})

//On tab creation, check if its a twitch tab, if so, join IRC channel
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab){ 
         if (changeInfo.url && (changeInfo.url).includes("twitch.tv")){
            //leave old channel if it exists
            if(channels[tabId]){
                socket.send(`PART #${channels[tabId]}`);
            }
            //change url in urls array and join new
            //urls[tabId] = changeInfo.url;
            reResult = changeInfo.url.match(re);
            channels[tabId] = reResult[reResult.length-1];
            socket.send(`JOIN #${channels[tabId]}`);
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
        if(channels[tabId]){
            socket.send(`PART #${channels[tabId]}`);
            channels.splice(tabId, 1);
            console.log(channels);
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