import React from 'react';
import { Container, ListGroup } from 'reactstrap';
import MessageEntry from './MessageEntry.jsx';

// container for message components
export default class MessageList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeUsername: '🎄 I R H E A D',
      activeEmoji: 'stuck_out_tongue.png',
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
              activeUsername={this.state.activeUsername}
              activeEmoji={this.state.activeEmoji}
              showEmojisDropdown={this.state.showEmojisDropdown}
              changeActiveEmoji={this.changeActiveEmoji}
            />
          ))}
        </Container>
      </div>
    );
  }
}
