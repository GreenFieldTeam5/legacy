const moment = require('moment-timezone');

const db = require('../database');
const socketHelpers = require('../server/webSocket.js');

const response = (code, message, method, data) =>
  JSON.stringify({
    code,
    message,
    method,
    data,
  });

const circadianAlertnessDictionary = {
  '00': 0.58,
  '01': 0.58,
  '02': 0.43,
  '03': 0.32,
  '04': 0.0,
  '05': 0.17,
  '06': 0.37,
  '07': 0.61,
  '08': 0.83,
  '09': 1.00,
  '10': 1.00,
  '11': 1.00,
  '12': 0.95,
  '13': 1.00,
  '14': 1.00,
  '15': 0.95,
  '16': 0.83,
  '17': 0.71,
  '18': 0.53,
  '19': 0.53,
  '20': 0.53,
  '21': 0.53,
  '22': 0.53,
  '23': 0.53,
};

const displayWorkspaceBodyClocks = async (messageText, username, workspaceId, ws, wss, parsedTime) => {

  let timezonesStringArray = ['These are the timezones of people in here:'];

  let timezones = await db.getAllTimezonesForWorkspace();

  console.log('Timezones in here: ', timezones);

  for (let dbResult of timezones) {
    let timeWhereTheyAre;
    if (parsedTime) {
      timeWhereTheyAre = moment().hours(parsedTime).minutes(0).tz(dbResult.current_timezone).format('HH:mm');

      // TODO what percentageAlertness will users be at, at a specific time

    } else {
      // no time specified default to now
      timeWhereTheyAre = moment.tz(dbResult.current_timezone).format('HH:mm');
    }

    let alertnessObject = await db.whatPercentageAlertnessAreUsersCurrentlyAt([dbResult.id]);

    console.log('alertnessObject: ', alertnessObject);

    const circadianAlertness = alertnessObject[dbResult.id];

    timezonesStringArray.push(`(${dbResult.username}, ${timeWhereTheyAre}, ${dbResult.current_timezone}, circadianAlertness: ${circadianAlertness})`);
  }

  const timezoneReplyString = timezonesStringArray.join(' ');
  console.log('timezoneReplyString: ', timezoneReplyString);

  // post the given message to the database
  let postedMessage = await db.postMessage(
    timezoneReplyString,
    'BodyClock',
    workspaceId,
  );
  [postedMessage] = postedMessage.rows;
  // respond back to client with success response and list of messages if successfully posted to the database
  ws.send(response(201, 'Post success', 'POSTMESSAGE', postedMessage));
  return socketHelpers.updateEveryoneElse(
    ws,
    wss,
    response(200, 'New message', 'NEWMESSAGE', {
      message: postedMessage,
      workspaceId: workspaceId,
    }),
  );
};

const displaySpecificBodyClocks = (messageText, username, workspaceId, ws, wss) => {

};

const lookForASpecificTime = (messageText) => {
  const timesRegex = /\b((0?[1-9]|1[012])([:.][0-5][0-9])?(\s?[ap]m)|([01]?[0-9]|2[0-3])([:.][0-5][0-9]))\b/;
  const regexResult = messageText.match(timesRegex);
  if (!regexResult) {
    return;
  }
  console.log('regexResult: ', regexResult[0]);
  const timeEnteredByUser = regexResult[0];
  let twentyFourHourTime;
  if (timeEnteredByUser.includes('.')) {
    [twentyFourHourTime] = timeEnteredByUser.split('.');
  } else if (timeEnteredByUser.includes(':')) {
    [twentyFourHourTime] = timeEnteredByUser.split(':');
  } else if (timeEnteredByUser.toUpperCase().includes('AM') || timeEnteredByUser.toUpperCase().includes('PM')) {
    // am
    // read numbers stop as soon as numbers stop
    let charArray = timeEnteredByUser.split('');
    let lastNumberIndex = 0;

    for (let i = 0; i < charArray.length; i += 1) {
      if (!isNaN(Number(charArray[i]))) {
        // number
        lastNumberIndex = i + 1;
      } else {
        // not a number
      }
    }

    twentyFourHourTime = timeEnteredByUser.slice(0, lastNumberIndex);

    if (timeEnteredByUser.toUpperCase().includes('PM')) {
      twentyFourHourTime = (Number(twentyFourHourTime) + 12) + '';
    }
  }

  return twentyFourHourTime;
};

const triageBodyClockRequest = (messageText, username, workspaceId, ws, wss) => {

  console.log('triageBodyClockRequest called');

  // search messageText for a reference to a specific time
  let parsedTime = lookForASpecificTime(messageText);
  console.log('Parsed time: ', parsedTime);

  displayWorkspaceBodyClocks(messageText, username, workspaceId, ws, wss, parsedTime);

  // 

  return true;
};

module.exports = {
  triageBodyClockRequest,
};
