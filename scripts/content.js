const oAuth = "vfbeot0djgnfbak436zr61z6vcc9xs";
const nick = "react";
const re = /[A-Za-z0-9_]+/g;
const youtubeRe = /https:\/\/youtu.be\/.+/;

let reResult = location.href.match(re);
let channel = reResult[reResult.length-1];
let currentMessageUser = "";

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

socket.addEventListener('open', () => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN #${channel}`);
})

socket.addEventListener('message', event => {
    //console.log(event.data);
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
            chrome.runtime.sendMessage({
                message: "open youtube link",
                url: link,
            })
        }
    }
})

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.message == "update channel"){
            socket.send(`PART #${channel}`);
            reResult = (request.url).match(re);
            channel = reResult[reResult.length-1];
            socket.send(`JOIN #${channel}`);
        }
    }
)
