import React from 'react';
import { Container, ListGroup } from 'reactstrap';
import MessageEntry from './MessageEntry.jsx';

// container for message components
export default class MessageList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeEmoji: 'em-stuck_out_tongue_winking_eye',
    };

    this.changeActiveEmoji = this.changeActiveEmoji.bind(this);
  }

  changeActiveEmoji(emoji) {
    this.setState({ activeEmoji: emoji });
  }

  render() {
    return (
      <div className="message-list-container">
        <Container>
          {this.props.messages.map(message => (
            <MessageEntry
              message={message}
              key={message.id}
              activeUsername={this.props.activeUsername}
              activeEmoji={message.activeEmoji || this.state.activeEmoji}
              showEmojisDropdown={this.state.showEmojisDropdown}
              changeActiveEmoji={this.changeActiveEmoji}
            />
          ))}
        </Container>
      </div>
    );
  }
}
