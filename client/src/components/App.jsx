import React from 'react';
import { connect, sendMessage } from '../socketHelpers';
import { Input } from 'reactstrap';
import NavBar from './NavBar.jsx';
import MessageList from './MessageList.jsx';
import Body from './Body.jsx';
import { TextEmojis } from './TextEmojis';

// The main component of the App. Renders the core functionality of the project.
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Default message informs the user to select a workspace
      messages: [
        {
          text: 'Type /remind to set yourself a quick reminder or /math to activate the math-bot!',
          username: 'Slack-Bot',
          activeEmoji: 'em-robot_face',
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
      showEmojisDropdown: false,
    };

    this.handleEmojiDropdownClick = this.handleEmojiDropdownClick.bind(this);
    this.handleEmojiClick = this.handleEmojiClick.bind(this);
  }

  componentDidMount() {
    let server = location.origin.replace(/^http/, 'ws');

    // connect to the websocket server
    connect(server, this);
  }

  // changes the query state based on user input in text field
  handleChange(event) {
    this.setState({
      query: event.target.value,
    });
  }

  // sends message on enter key pressed and clears form
  // only when shift+enter pressed breaks to new line
  handleKeyPress(event) {
    // on key press enter send message and reset text box
    if (event.charCode === 13 && !event.shiftKey) {
      event.preventDefault();
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

  handleEmojiDropdownClick() {
    this.setState({ showEmojisDropdown: !this.state.showEmojisDropdown });
  }
  handleEmojiClick(emoji) {
    this.setState({
      query: `${this.state.query} <i class="em ${emoji}"></i> `,
      showEmojisDropdown: !this.state.showEmojisDropdown,
    });
  }

  // renders nav bar, body(which contains all message components other than input), and message input
  render() {
    let {
      messages, query, workSpaces, currentWorkSpaceId, currentWorkSpaceName,
    } = this.state;

    var placeholder = (currentWorkSpaceId === 0) ? 
      `Slack-Bot at your service!` : `Message #${currentWorkSpaceName}` || 'select a workspace!';

    const styles = {
      emojiDropdownContent: {
        backgroundColor: 'Snow',
        border: 'solid black',
        padding: '5px',
        paddingBottom: '0',
        position: 'absolute',
        marginLeft: '125px',
        bottom: '25px',
        margin: 'auto',
        width: '600px',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        zIndex: '1',
        maxHeight: '150px',
        overflowX: 'auto',
      },
    };
    return (
      <div className="app-container">
        <NavBar currentWorkSpaceName={currentWorkSpaceName} />
        <Body
          messages={messages}
          workSpaces={workSpaces}
          loadWorkSpaces={() => this.loadWorkSpaces()}
          changeCurrentWorkSpace={(id, name) => this.changeCurrentWorkSpace(id, name)}
          currentWorkSpaceId={currentWorkSpaceId}
          activeUsername={this.props.location.state.username}
        />
        <div style={{ marginLeft: '150px', position: 'relative' }}>
          {this.state.showEmojisDropdown &&
            <div style={styles.emojiDropdownContent} className="emoji-dropdown-content">
              {TextEmojis.map(emoji => (
                <i key={emoji} className={`em ${emoji}`} onClick={() => this.handleEmojiClick(emoji)}></i>
              ))}
            </div>
          }
        </div>
        <div className="input-container">
          <div style={{ display: 'flex' }}>
            <div onClick={this.handleEmojiDropdownClick}>
              <i className="em em-stuck_out_tongue"></i>
            </div>
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
      </div>
    );
  }
}
