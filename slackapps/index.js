const BodyClockApp = require('./BodyClockApp.js');
const reminderBotApp = require('./ReminderApp.js');

// Line 104-105 webSocket.js

const parseMessageForBotInvocation = (messageText) => {
  // if no bot invoked simply return false
  console.log(messageText);
  return false;
};

module.exports = {
  parseMessageForBotInvocation,
};

