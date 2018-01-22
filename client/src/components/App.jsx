import React from 'react';
import { Input } from 'reactstrap';
import moment from 'moment-timezone';

import { connect, sendMessage, sendKeystrokeMetaData } from '../socketHelpers';
import NavBar from './NavBar.jsx';
import MessageList from './MessageList.jsx';
import Body from './Body.jsx';

// The main component of the App. Renders the core functionality of the project.
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Default message informs the user to select a workspace
      messages: [
        {
          text: 'Type /remind to set yourself a quick reminder',
          username: 'Slack-bot',
          id: 0,
          createdAt: new Date(),
          workspaceId: 0,
        },
      ],
      users: [],
      workSpaces: [],
      query: '',
      currentWorkSpaceId: 0,
      currentWorkSpaceName: '',
      slackBot: [],
      dateTimeOfLastKeystroke: new Date(),
      userId: undefined,
      last10KeystrokeDurations: [],
    };
  }

  componentDidMount() {
    let server = location.origin.replace(/^http/, 'ws');

    // connect to the websocket server
    connect(server, this);
    this.getUserId();
  }

  getUserId() {
    fetch(`/userdetails/${this.props.location.state.username}`)
      .then(resp => resp.json())
      .then(userId => this.setState({ userId }))
      .catch(console.error);
  }

  // changes the query state based on user input in text field
  handleChange(event) {

    let now = new Date();
    let keystrokeTimeGap = now.getTime() - this.state.dateTimeOfLastKeystroke.getTime();

    if (keystrokeTimeGap < 2000) {
      this.state.last10KeystrokeDurations.push(keystrokeTimeGap);
      if (this.state.last10KeystrokeDurations.length >= 10) {
        const copyKeystrokeArray = this.state.last10KeystrokeDurations.slice(0);
        this.handleKeystrokeUpdate(copyKeystrokeArray, now);
        this.setState({
          last10KeystrokeDurations: [],
        });
      }
    }

    this.setState({
      query: event.target.value,
      dateTimeOfLastKeystroke: now,
    });
  }

  handleKeystrokeUpdate(keystrokeTimeGapArray, nowDateTime) {
    // create special send keystroke time gap function

    // get rough and ready median
    keystrokeTimeGapArray.sort((a, b) => a - b);
    const medianKeystrokeTimeGap = keystrokeTimeGapArray[5];
    
    // get the milliseconds since midnight local time
    let midnight = nowDateTime;
    midnight.setHours(0, 0, 0, 0);
    const now = new Date();
    const msSinceMidnight = now - midnight;
    const currentTimezone = moment.tz.guess();

    sendKeystrokeMetaData({
      user_id: this.state.userId,
      keystroke_duration: medianKeystrokeTimeGap,
      millisecondsAfterMidnightLocalTime: msSinceMidnight,
      current_timezone: currentTimezone,
    });
  }

  // sends message on enter key pressed and clears form
  // only when shift+enter pressed breaks to new line
  handleKeyPress(event) {
    // on key press enter send message and reset text box
    if (event.charCode === 13 && !event.shiftKey) {
      event.preventDefault();
      console.log(this.props);
      sendMessage({
        username: this.props.location.state.username,
        text: this.state.query,
        workspaceId: this.state.currentWorkSpaceId,
      });
      // resets text box to blank string
      this.setState({
        query: '',
      });
    }
  }
  // grabs all existing workspaces
  loadWorkSpaces() {
    fetch('/workspaces')
      .then(resp => resp.json())
      .then(workSpaces => this.setState({ workSpaces }))
      .catch(console.error);
  }

  // Helper function to reassign current workspace
  changeCurrentWorkSpace(id, name) {
    this.setState({ currentWorkSpaceId: id, currentWorkSpaceName: name });
  }
  // renders nav bar, body(which contains all message components other than input), and message input
  render() {
    let {
      messages, query, workSpaces, currentWorkSpaceId, currentWorkSpaceName,
    } = this.state;

    var placeholder = (currentWorkSpaceId === 0) ? 
      `Slack-Bot at your service!` : `Message #${currentWorkSpaceName} || 'select a workspace!'`;

    return (
      <div className="app-container">
        <NavBar currentWorkSpaceName={currentWorkSpaceName} />
        <Body
          messages={messages}
          workSpaces={workSpaces}
          loadWorkSpaces={() => this.loadWorkSpaces()}
          loadSlackBot={() => this.loadSlackBot()}
          changeCurrentWorkSpace={(id, name) => this.changeCurrentWorkSpace(id, name)}
          currentWorkSpaceId={currentWorkSpaceId}
        />
        <div className="input-container">
          <Input
            value={query}
            className="message-input-box"
            type="textarea"
            name="text"
            placeholder={placeholder}
            onChange={event => this.handleChange(event)}
            onKeyPress={event => this.handleKeyPress(event)}
          />
        </div>
      </div>
    );
  }
}
