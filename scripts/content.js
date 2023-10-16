const oAuth = "vfbeot0djgnfbak436zr61z6vcc9xs";
const nick = "react";
const re = /[A-Za-z0-9_]+/g;
const reResult = location.href.match(re);
const channel = reResult[reResult.length-1];

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

socket.addEventListener('open', () => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN #${channel}`);
})


let currentMessageUser = "";
socket.addEventListener('message', event => {
    console.log(event.data);
    /*
    currentMessageUser = event.data.match(/[A-Za-z0-9_]+/)[0];
    console.log(currentMessageUser);
    */
    if(event.data.includes("PING")) socket.send("PONG");
})

