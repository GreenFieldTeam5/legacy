const BodyClockApp = require('./BodyClockApp.js');
const reminderBotApp = require('./ReminderApp.js');
const CronJob = require('cron').CronJob;

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
  console.log(messageText);
  return false;
};

const parseMessageForRemind = (messageText, username, workspaceId, ws, wss) => {
  const wordsOfMessage = messageText.split(' ');

  // remind me to be kind in 10 minutes
  if (wordsOfMessage[0] === '/remind' && wordsOfMessage[1] === 'me') {
    var endOfVerb = wordsOfMessage.indexOf('in');
    var verb = wordsOfMessage.slice(2, endOfVerb) 
    var quantity = wordsOfMessage[endOfVerb + 1];
    var measurement = wordsOfMessage[endOfVerb + 2];

    var seconds = minutes = hours = days = month = dayOfWeek = '*';

    if (measurement === 'seconds') var seconds = quantity;
    else if (measurement === 'minutes') var minutes = quantity;
    else if (measurement === 'hours') var hours = quantity;
    else if (measurement === 'day') var day = quantity;
    else if (measurement === 'month') var month = quantity;
    else if (measurement === 'dayOfWeek') var dayOfWeek = quantity;
    console.log(seconds, minutes, hours);

    new CronJob('* * * * * *', function() {
      console.log('You will see this message every second');
    }, null, true, 'America/Los_Angeles');

    // var job = new CronJob(`${seconds} ${minutes} ${hours} ${day} ${month} ${dayOfWeek}`, () => {
    //   console.log('abc');
    // }, true)
  }
}

module.exports = {
  parseMessageForBotInvocation,
  parseMessageForRemind,
};

