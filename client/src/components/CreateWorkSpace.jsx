import React from 'react';
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';

//this is the button and then the actual popup that appears to create a workspace
export default class CreateWorkSpace extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      popoverOpen: false,
    };
  }
  //Changes the popout state
  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
  }

  //calls workspace creation then pops back down
  handleClick() {
    this.props.createWorkSpace();
    this.closePopUp();
  }

  //grabs the input value
  handleChange(event) {
    event.preventDefault();
    this.props.getWorkSpaceQuery(event.target.value);
  }

  //Closes popup for sure
  closePopUp() {
    this.setState({
      popoverOpen: false,
    });
  }
  //Renders the button. When clicked, the button will toggle the popup.
  render() {
    return (
      <div>
        <Button id="Popover1" onClick={this.toggle}>
          +
        </Button>
        <Popover
          placement="bottom"
          isOpen={this.state.popoverOpen}
          target="Popover1"
          toggle={this.toggle}
        >
          <PopoverHeader>Enter Workspace name: </PopoverHeader>
          <PopoverBody>
            <input type="text" placeholder="workspace name.." onChange={event => this.handleChange(event)} />
            <button onClick={() => this.handleClick()}> Add </button>
          </PopoverBody>
        </Popover>
      </div>
    );
  }
}
