const BodyClockApp = require('./BodyClockApp.js');
const reminderBotApp = require('./ReminderApp.js');
const CronJob = require('cron').CronJob;
const helpers = require('./helpers.js');
const Moment = require('moment');
const db = require('../database/index.js');
const socketHelpers = require('../server/webSocket.js');
const axios = require('axios');

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

const parseMessageForRemindAndMathBot = (messageText, username, workspaceId, ws, wss) => {
  const wordsOfMessage = messageText.split(' ');
  const firstWord = wordsOfMessage[0];

  if (firstWord.includes('/help')) {
    const msg = `Hi, I am Sally the Helper Bot! Type /remind, /math, /fact, /chuck to utilize my other friends!`;

    setTimeout(function() {
      helpers.botMessage(new Date(), msg, 'Sally-Bot', 'em-unicorn_face', ws, wss);
    }, 1000);
  } else if (firstWord === '/math') {
    var answer = eval(wordsOfMessage.slice(1).join(' '));
    setTimeout(function() {
      helpers.botMessage(new Date(), answer, 'Leo-Bot', 'em-lion_face', ws, wss);
    }, 1000);
  } else if (firstWord === '/chuck') {
    axios.get('https://api.chucknorris.io/jokes/random')
    .then(data => {
      setTimeout(function() {
        helpers.botMessage(new Date(), data.data.value, 'Chuck-Norris-Bot', 'em-upside_down_face', ws, wss);
      }, 1000);
    });
  } else if (firstWord === '/remind' && wordsOfMessage[1] === 'me') {
    var static = false;
    var triggerTime;
    var lastWord = wordsOfMessage[wordsOfMessage.length - 1];

    if (wordsOfMessage.indexOf('in') !== -1) endOfAction = wordsOfMessage.indexOf('in');
    else {
      endOfAction = wordsOfMessage.indexOf('at');
      static = true;
    }

    var verb = wordsOfMessage.slice(3, endOfAction)
    if (static) triggerTime = helpers.getStaticTriggerTime(lastWord);
    else {
      var quantity = parseInt(wordsOfMessage[endOfAction + 1]);
      triggerTime  = helpers.getDynamicTriggerTime(quantity, lastWord);
    }

    try {
      new CronJob(triggerTime, function() {
        helpers.botMessage(triggerTime, verb.join(' '), 'Joel-Bot', 'em-male-teacher', ws, wss);
      }, null, true, 'America/Los_Angeles');
    } catch(ex) {
      console.log("cron pattern not valid");
    }
  }
}

module.exports = {
  parseMessageForBotInvocation,
  parseMessageForRemindAndMathBot,
};

