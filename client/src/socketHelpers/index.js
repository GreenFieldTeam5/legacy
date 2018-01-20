let ws = null;
let app = null;
let sent = false;
const beep = new Audio('/sounds/pling.wav'); // sound on receive msg
const oneup = new Audio('/sounds/coin.wav'); // sound on send msg

/* takes in an array of messages
  objects and sets the component state messages
  with the new array of messages recieved */
const loadMessages = (messages) => {
  app.setState({ messages });
};

/* takes in message as object
   msg ({id: INT, text: STRING, createdAt: DATE, workspaceId: INT})
   and concats message to message state of app */
const addNewMessage = (message) => {
  if (sent) {
    sent = false;
  } else {
    beep.play();
  }
  app.setState({ messages: [...app.state.messages, message] });
};

// takes in an array of users and sets the current app state
const setUsers = (users) => {
  app.setState({ users });
};

// takes in a parameter and sends that parameter to the socket server
const sendMessage = (data) => {
  const msg = {
    method: 'POSTMESSAGE',
    data: {
      username: data.username,
      text: data.text,
      workspaceId: data.workspaceId,
    },
  };
  oneup.play();
  sent = true;
  ws.send(JSON.stringify(msg));
};

// takes a few params which it inputs to the influxDB
const sendKeystrokeMetaData = (keystrokeData) => {
  const keystrokePacket = {
    method: 'KEYSTROKEPACKET',
    data: {
      user_id: keystrokeData.user_id,
      keystroke_duration: keystrokeData.keystroke_duration,
      millisecondsAfterMidnightLocalTime: keystrokeData.millisecondsAfterMidnightLocalTime,
      current_timezone: keystrokeData.current_timezone,
    },
  };

  console.log('End of trying to send of keystroke process: ', Date());

  ws.send(JSON.stringify(keystrokePacket));
};

// takes a workspace Id as INT for parameter and returns the messages for that current workspace
const getWorkSpaceMessagesFromServer = (id) => {
  const msg = { method: 'GETMESSAGES', data: { workspaceId: id } };
  ws.send(JSON.stringify(msg));
};

// takes in all new messages and filters and concats messages that match the current workSpace
const filterMsgByWorkSpace = (msg) => {
  if (sent) {
    sent = false;
  } else {
    beep.play();
  }
  if (msg.workspaceId === app.state.currentWorkSpaceId) {
    app.setState({ messages: [...app.state.messages, msg.message] });
  }
};

// ws refers to websocket object
const afterConnect = () => {
  ws.onmessage = (event) => {
    let serverResp = JSON.parse(event.data);

    console.log('Server response should not be being called');

    // TODO: better error handling. Temp till complete switch statements
    if (serverResp.code === 400) {
      console.log(serverResp.method);
      throw serverResp.message;
    }

    switch (serverResp.method) {
      case 'GETMESSAGES':
        loadMessages(serverResp.data);
        break;
      case 'NEWMESSAGE':
        filterMsgByWorkSpace(serverResp.data);
        break;
      case 'GETUSERS':
        setUsers(serverResp.data);
        break;
      case 'POSTMESSAGE':
        addNewMessage(serverResp.data);
        break;
      default:
    }
  };
};

// takes in server ip or wss protocall to connect to server
// takes in component to have scope in function
const connect = (server, component) => {
  // create new socket server instance
  ws = new WebSocket(server);
  app = component;
  // on connection run the callback
  ws.addEventListener('open', () => {
    console.log('Connected to the server');
    // sets state to current socket session for App methods to have access
    app.setState({ ws });

    // gets workspaces after connection
    app.loadWorkSpaces();

    // calls after connect function that takes in the socket session
    // and app component
    afterConnect();
  });
};

export { connect, sendMessage, afterConnect, getWorkSpaceMessagesFromServer, sendKeystrokeMetaData };
