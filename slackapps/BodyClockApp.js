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

const convert24HourClockToCircadian = (timeString) => {
  let timeStringArray = timeWhereTheyAre.split(':');
    let hour = timeStringArray[0]
}

const displayWorkspaceBodyClocks = async (messageText, username, workspaceId, ws, wss) => {

  let timezonesStringArray = ['These are the timezones of people in here:'];

  // get the timezones of everyone in the workspace
  let timezones = await db.getAllTimezonesForWorkspace();

  timezones.forEach((dbResult) => {
    const timeWhereTheyAre = moment.tz(dbResult.current_timezone).format('HH:mm');
    console.log('Time where they are: ', timeWhereTheyAre);
    console.log(typeof timeWhereTheyAre);

    

    timezonesStringArray.push(`(${dbResult.username}, ${timeWhereTheyAre}, ${dbResult.current_timezone})`);
  });

  const timezoneReplyString = timezonesStringArray.join(' ');

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

const triageBodyClockRequest = (messageText, username, workspaceId, ws, wss) => {

  
  displayWorkspaceBodyClocks(messageText, username, workspaceId, ws, wss);

  return true;
};

module.exports = {
  triageBodyClockRequest,
};
