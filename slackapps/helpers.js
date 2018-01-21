var moment = require('moment');

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

const parseMessage = function(slackBotObj, text, triggerTime) {
    return {
        method: 'POSTMESSAGE',
        data: {
            id: slackBotObj.id,
            username:slackBotObj.username,
            text: text,
            createdAt: triggerTime,
            activeEmoji: 'em-robot_face',
            workspaceId: 0
        }
    }
}

 module.exports = {
    getDynamicTriggerTime,
    getStaticTriggerTime,
    parseMessage
 }