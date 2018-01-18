import React from 'react';
import { Container, Media } from 'reactstrap';
import { EmojisList } from './EmojisList';

// Individual message container
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleHover: false,
      showEmojisDropdown: false,
    };

    this.handleEmojiDropdownClick = this.handleEmojiDropdownClick.bind(this);
    this.handleEmojiClick = this.handleEmojiClick.bind(this);
  }
  toggleHover() {
    this.setState({ toggleHover: !this.state.toggleHover });
  }
  handleEmojiClick(emoji) {
    this.props.changeActiveEmoji(emoji);
    this.setState({
      showEmojisDropdown: !this.state.showEmojisDropdown,
    });
  }
  handleEmojiDropdownClick() {
    if (this.props.activeUsername !== this.props.message.username) return;
    this.setState({ showEmojisDropdown: !this.state.showEmojisDropdown });
  }

  render() {
    const { message } = this.props;
    // for the color changing avatars
    let color = () => {
      let colors = [
        '#346A85',
        '#AFE356',
        '#348569',
        '#F6a43D',
        '#AAD3E6',
        '#7F3485',
        '#992B41',
        '#3B94D9',
        '#E95F28',
        '#4A913C',
        '#FFAC33',
        '#8899A6',
        '#744EAA',
        '#BE1931',
      ];
      let index = Math.floor(Math.random() * colors.length);
      return colors[index];
    };
    // Styles for individual message component
    const styles = {
      body: {
        padding: '15px 0 15px 0',
        display: 'flex',
      },
      timeStamp: {
        fontSize: '10px',
        color: '#bdbdbd',
        marginLeft: '10px',
      },
      username: {
        fontSize: '24',
        fontWeight: 'bold',
        display: 'block',
        paddingBottom: '5px',
      },
      message: {
        fontSize: '0.9em',
        overflowWrap: 'break-word',
        textAlign: 'left',
        display: 'fixed',
        left: '63.99',
      },
      egg: {
        backgroundColor: color(),
        float: 'left',
        marginRight: '7px',
      },
      emojiDropdownContent: {
        backgroundColor: 'Snow',
        border: 'solid black',
        padding: '5px',
        paddingBottom: '0',
        marginLeft: '75px',
        display: 'block',
        position: 'absolute',
        width: '300px',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        zIndex: '1',
        maxHeight: '150px',
        overflowX: 'auto',
      },
    };

    return (
      <div className="message-entry-container">
        <Container style={styles.body}>
          <Media>
            <img
              className="egg img-responsive"
              src={`emoji/${message.username === this.props.activeUsername ? this.props.activeEmoji : 'stuck_out_tongue.png'}`}
              style={styles.egg}
              onClick={this.handleEmojiDropdownClick}
            />
            {this.state.showEmojisDropdown &&
              <div style={styles.emojiDropdownContent} className="emoji-dropdown-content">
                {EmojisList.map(emoji => (
                  <img
                    key={emoji}
                    src={`emoji/${emoji}`}
                    height="32px"
                    width="32px"
                    onClick={() => this.handleEmojiClick(emoji)}
                  />
                ))}
              </div>
            }
          </Media>
          <span style={styles.username}>
            {message.username}
            <span style={styles.timeStamp}>{new Date(message.createdAt).toLocaleTimeString()}</span>
          </span>
          <div style={styles.message}>{message.text}</div>
        </Container>
      </div>
    );
  }
}
