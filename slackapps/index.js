const BodyClockApp = require('./BodyClockApp.js');
const reminderBotApp = require('./ReminderApp.js');
const CronJob = require('cron').CronJob;
const helpers = require('./helpers.js');
const Moment = require('moment');
const db = require('../database/index.js');
const socketHelpers = require('../server/webSocket.js');

// Line 104-105 webSocket.js

const currentSlackAppNames = ['BODYCLOCK'];
const slackApps = [BodyClockApp];

const parseMessageForBotInvocation = (messageText, username, workspaceId, ws, wss) => {

  // you're parseing the message for any '@appName' or '/appName'
  const wordsOfMessage = messageText.split(' ');
  for (let i = 0; i < wordsOfMessage.length; i += 1) {
    let currentWord = wordsOfMessage[i];
    if (currentWord.charAt(0) === '@') {
      // there has been a bot invocation, check if it's in the list of bots we know about
      const adjustedWord = currentWord.slice(1).toUpperCase(); // toUpperCase to ensure user doesn't have to get all correct caps
      const indexOfSlackApp = currentSlackAppNames.indexOf(adjustedWord);
      if (indexOfSlackApp >= 0) {
        // now time to send off to the relevant slackapp
        slackApps[indexOfSlackApp].triageBodyClockRequest(messageText, username, workspaceId, ws, wss);
      } else {
        return false;
      }
    }
  }
  // if no bot invoked simply return false
  // console.log(messageText);
  return false;
};

const parseMessageForRemind = (messageText, username, workspaceId, ws, wss) => {
  const wordsOfMessage = messageText.split(' ');

  // remind me to be kind in 10 minutes
  if (wordsOfMessage[0] === '/remind' && wordsOfMessage[1] === 'me') {
    var endOfAction = wordsOfMessage.indexOf('in');
    var lastWord    = wordsOfMessage[wordsOfMessage.length - 1];
    var verb;
    var triggerTime;

    if (endOfAction === -1) {
      console.log('static trigger time');
      endOfAction = wordsOfMessage.indexOf('at');
      verb        = wordsOfMessage.slice(3, endOfAction)
      triggerTime = helpers.getStaticTriggerTime(lastWord);
    } else {
      console.log('dynamic trigger time');
      var quantity    = parseInt(wordsOfMessage[endOfAction + 1]);
      verb            = wordsOfMessage.slice(3, endOfAction)
      triggerTime     = helpers.getDynamicTriggerTime(quantity, lastWord);
    }

    console.log("triggerTime", triggerTime);

    try {
      new CronJob(triggerTime, function() {
        const message = verb.join(' ');
        db.postMessage(message, 'Slack-Bot', 0);
        db.getMessages(0).then(data => {
          const slackBotObj = data[data.length - 1];
          const senderUsername = (data[data.length - 2].username[0]).toUpperCase() + data[data.length - 2].username.substr(1);
          const text = `Hey ${senderUsername}, Just here to remind you to ${slackBotObj.text.bold()}.`
          let msg = {
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
          ws.send(JSON.stringify(msg));
        });

      }, null, true, 'America/Los_Angeles');
    } catch(ex) {
      console.log("cron pattern not valid");
    }
  }
}

module.exports = {
  parseMessageForBotInvocation,
  parseMessageForRemind,
};

