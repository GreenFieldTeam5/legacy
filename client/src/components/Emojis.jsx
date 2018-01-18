import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, FormGroup } from 'reactstrap';
import { EmojisList } from './EmojisList';

export default class Emojis extends React.Component {
  constructor(props) {
    super(props);
    this.styles = {
      body: {
        paddingTop: '40px',
        paddingBottom: '40px',
        maxWidth: '330px',
        padding: '15px',
        margin: '0 auto',
        textAlign: 'center',
      },
      emojiDropdownContent: {
        backgroundColor: 'Snow',
        border: 'solid black',
        padding: '5px',
        paddingBottom: '0',
        display: 'block',
        position: 'absolute',
        width: '300px',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        zIndex: '1',
        maxHeight: '150px',
        overflowX: 'hidden',
        overflowX: 'auto', 
      },
    };
    this.state = {
      activeEmoji: 'stuck_out_tongue.png',
      showEmojisDropdown: false,
    };
    this.handleEmojiDropdownClick = this.handleEmojiDropdownClick.bind(this);
    this.handleEmojiClick = this.handleEmojiClick.bind(this);
  }

  handleEmojiDropdownClick() {
    this.setState({ showEmojisDropdown: !this.state.showEmojisDropdown });
  }
  handleEmojiClick(emoji) {
    this.setState({ 
      activeEmoji: emoji,
      showEmojisDropdown: !this.state.showEmojisDropdown,
    });
  }

  render () {
    return (
      <Container style={this.styles.body}>
        HI CAT WAS HERE. CLICK EMOJI FACE TO CHOOSE YOUR EMOJI!
        <div className="emoji-dropdown-button">
          <img
            src={'emoji/' + this.state.activeEmoji}
            onClick={this.handleEmojiDropdownClick}
          />
        </div>
        {this.state.showEmojisDropdown &&
          <div style={this.styles.emojiDropdownContent} className="emoji-dropdown-content">
            {EmojisList.map(emoji => (
              <img
                key={emoji}
                src={'emoji/' + emoji}
                height="32px"
                width="32px"
                onClick={() => this.handleEmojiClick(emoji)}
              />
            ))}
          </div>
        }
      </Container>
    );
  }
};


