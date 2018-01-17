const BodyClockApp = require('./BodyClockApp.js');


const parseMessageForBotInvocation = (messageText) => {
  // if no bot invoked simply return false
  return false;
};

module.exports = {
  parseMessageForBotInvocation,
};
