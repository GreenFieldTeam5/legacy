const WebSocket = require('ws');

const db = require('../database');
const SlackApps = require('../slackapps');

// creates a response object for sending to clients
/*
Object used for communication between server and clients through WebSockets -
{
  code: Only sent by server when responding to a request from a client, follows HTTP status code conventions
  message: Only sent by server when responding to a request from a client, text description of the code number
  method: Always required, dictates what the request/response is for (GETMESSAGES, POSTMESSAGE, NEWMESSAGE)
  data: Data required to process the request/response method
}
*/
const response = (code, message, method, data) =>
  JSON.stringify({
    code,
    message,
    method,
    data,
  });

// sends data to all cients except client ws
const updateEveryoneElse = (ws, wss, data) => {
  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// event handler for incoming data from any client
const onMessage = async (ws, wss, data) => {
  let message;
  try {
    // attempt to parse data from client, if unparseable responsd back with 400 and parsing error
    message = JSON.parse(data);
  } catch (err) {
    return ws.send(response(400, err.message));
  }

  // switch case to determine what to do with the message
  switch (message.method) {
    case 'GETMESSAGES':
    // method GETMESSAGES returns a list of previous messages for the given workspaceId
    /*
    Request from client to server:
    {
      method: 'GETMESSAGES',
      data: {
        workspaceId: 1, //request workspace's id
      }
    }

    Response from server to client:
    {
      code: 200,
      message: 'Request success',
      method: 'GETMESSAGES',
      data: [{  //return an array of message objects from the requested workspace
        id: 1,
        text: 'this is a test message',
        username: 'testUser',
        createdAt: '2018-01-15T20:15:29.269Z',
      }, ...],
    }
    */
      try {
        const messages = await db.getMessages(Number(message.data.workspaceId));
        // respond back to client with success response and list of messages if successfully pulled from database
        return ws.send(response(200, 'Request success', message.method, messages));
      } catch (err) {
        // respond back to client with error response and error message if messages can't be pulled from database
        return ws.send(response(400, err.stack, message.method));
      }
    case 'POSTMESSAGE':
    // method POSTMESSAGE posts a message to the workspace for the given workspaceId
    /*
    Request from client to server:
    {
      method: 'POSTMESSAGE',
      data: {
        text: 'test message',
        username: 'testUser',
        workspaceId: 1, //workspace id to post messsage to
      }
    }

    Response from server to client:
    {
      code: 200,
      message: 'Post success',
      method: 'POSTMESSAGE',
      data: {  //return back the successfully posted message object
        id: 1,
        text: 'test message',
        username: 'testUser',
        createdAt: '2018-01-15T20:15:29.269Z',
      },
    }
    */
      try {
        // check if the message received includes @appName for one of the slack apps we have running
        //SlackApps.parseMessageForBotInvocation(message.data.text, message.data.username, message.data.workspaceId);

        // post the given message to the database
        let postedMessage = await db.postMessage(
          message.data.text,
          message.data.username,
          message.data.workspaceId,
        );
        [postedMessage] = postedMessage.rows;
        // respond back to client with success response and list of messages if successfully posted to the database
        ws.send(response(201, 'Post success', message.method, postedMessage));
        // notify all other connected clients that a new message has been posted with a NEWMESSAGE response
        /*
        Request from server to client:
        {
          method: 'NEWMESSAGE',
          data: {  //send the new message to all other clients along with workspaceId of message
            message: {
              id: 1,
              text: 'test message',
              username: 'testUser',
              createdAt: '2018-01-15T20:15:29.269Z',
            },
            workspaceId: 1,
          },
        }
        */
        return updateEveryoneElse(
          ws,
          wss,
          response(200, 'New message', 'NEWMESSAGE', {
            message: postedMessage,
            workspaceId: message.data.workspaceId,
          }),
        );
      } catch (err) {
        // respond back to client with error response and error message if message can't be posted to database
        return ws.send(response(400, err.stack, message.method));
      }
    default:
      // unknown message sent to server, respond back to client
      return ws.send(response(405, 'Unknown method', message.method));
  }
};

// event handler for when client connects to websocket server
const onConnect = (ws, wss) => {
  // attaches event handler for when client sends message to server
  ws.on('message', data => onMessage(ws, wss, data));
};

module.exports = {
  onConnect,
};
