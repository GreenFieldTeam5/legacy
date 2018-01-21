var moment = require('moment');
var db = require('../database/index.js');

const getDynamicTriggerTime = function(quantity, measurement){
    const timeNow = new Date();
    var triggerTime = null;

    if (measurement === 'seconds') {
        triggerTime = new Date(timeNow.setSeconds(timeNow.getSeconds() + quantity));
    } else if (measurement === 'second') {
        triggerTime = new Date(timeNow.setSeconds(timeNow.getSeconds() + 1));
    } else if (measurement === 'minutes') {
        triggerTime = new Date(timeNow.setMinutes(timeNow.getMinutes() + quantity));
    } else if (measurement === 'minute') {
        triggerTime = new Date(timeNow.setMinutes(timeNow.getMinutes() + 1));
    } else if (measurement === 'hours') {
        triggerTime = new Date(timeNow.setHours(timeNow.getHours() + quantity));
    } else if (measurement === 'hour') {
        triggerTime = new Date(timeNow.setHours(timeNow.getHours() + 1));
    }
    console.log(triggerTime);
    return triggerTime;
  }

const getStaticTriggerTime = function(word) {
    var timeNow = new Date();
    var day  = timeNow.getDate();
    var hour = timeNow.getHours();
    var mins = timeNow.getMinutes();

    if (word.includes(':')) {
        hour = word.substring(0, word.length - 2).split(':')[0];
        mins = word.substring(0, word.length - 2).split(':')[1];
        if (word.includes('pm')) hour = parseInt(hour) + 12;
    } else {
        if (word.includes('pm')) {
            hour = parseInt(word.split('pm')[0]) + 12;
            mins = 0;
        } else if (word.includes('am')) {
            hour = word.split('am')[0];
            mins = 0;
        }
    }

    triggerTime = new Date(timeNow.setHours(hour, mins, 0));

    return triggerTime;    
}

const parseMessage = function(slackBotObj, text, triggerTime, emoji) {
    return {
        method: 'POSTMESSAGE',
        data: {
            id: slackBotObj.id,
            username:slackBotObj.username,
            text: text,
            createdAt: triggerTime,
            activeEmoji: emoji,
            workspaceId: 0
        }
    }
}

const botMessage = function(triggerTime, message, botName, emoji, ws, wss) {
    let text = '';
    db.postMessage(message, botName, 0);
    db.getMessages(0).then(data => {
        const slackBotObj = data[data.length - 1];
        const senderUsername = (data[data.length - 2].username[0]).toUpperCase() + data[data.length - 2].username.substr(1);
        if (botName.includes('Joel')) text = `Hey ${senderUsername}, Joel here to remind you to ${slackBotObj.text.bold()}. I'll set up reminders for you anytime!`
        else if (botName.includes('Leo')) text = `Hey ${senderUsername}, Leo here. The answer is ${slackBotObj.text.bold()}. Ask me another math question anytime!`;
        else text = message;
        let msg = parseMessage(slackBotObj, text, triggerTime, emoji);
        ws.send(JSON.stringify(msg));
    });
}

 module.exports = {
    getDynamicTriggerTime,
    getStaticTriggerTime,
    parseMessage,
    botMessage
 }