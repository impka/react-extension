const oAuth = "vfbeot0djgnfbak436zr61z6vcc9xs";
const nick = "react";
const re = /[A-Za-z0-9_]+/
const reResult = re.exec(window.location.href)
const channel = reResult[reResult.length-1];

alert("Channel");

const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

socket.addEventListener('open', () => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    socket.send(`JOIN #${channel}`);
})

socket.addEventListener('message', event => {
    console.log(channel);
    console.log(event.data)
})