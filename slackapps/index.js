const BodyClockApp = require('./BodyClockApp.js');


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
  return false;
};

module.exports = {
  parseMessageForBotInvocation,
};
