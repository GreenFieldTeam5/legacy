import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Alert, FormGroup, Input, Button } from 'reactstrap';
import Moment from 'moment-timezone';

export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      passwordHint: '',
      signupSuccess: false,
      signupStatus: '',
    };
  }

  
  signUp() {
    //checks for validity
    let {
      username, password, email, passwordHint,
    } = this.state;
    if (username === '') {
      return this.setState({ signupStatus: 'Enter a username' });
    }
    if (password === '') {
      return this.setState({ signupStatus: 'Enter a password' });
    }
    if (email === '') {
      return this.setState({ signupStatus: 'Enter an email' });
    }

    // get the user's timezone
    const clientTimezone = Moment.tz.guess();

    //actual post to database
    fetch('/signup', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        email,
        passwordHint,
        clientTimezone,
      }),
      headers: { 'content-type': 'application/json' },
    })
      .then(resp =>
        (resp.status === 200
          ? this.setState({ signupSuccess: true })
          : this.setState({ signupStatus: `${resp.status} - ${resp.statusText}` })))
      .catch(console.error);
  }

  //Handles form input
  handleOnChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  //Handles for confirm on Enter
  handleKeyPress(event) {
    return event.key === 'Enter' ? this.signUp() : undefined;
  }

  render() {
    const styles = {
      body: {
        paddingTop: '40px',
        paddingBottom: '40px',
        maxWidth: '330px',
        padding: '15px',
        margin: '0 auto',
        textAlign: 'center',
      },
    };

    return (
      <div style={styles.body}>
        {this.state.signupSuccess ? (
          <Redirect
            to={{
              pathname: '/login',
            }}
          />
        ) : (
          <div>
            <Link style={{ textDecoration: 'none' }} to="/">
              <h1>slackk-casa</h1>
            </Link>
            <br />
            {this.state.signupStatus ? (
              <Alert color="danger">{this.state.signupStatus}</Alert>
            ) : (
              undefined
            )}
            <h2>Sign up</h2>
            <br />
            <FormGroup>
              <Input
                type="text"
                placeholder="Username*"
                name="username"
                onChange={e => this.handleOnChange(e)}
                onKeyPress={e => this.handleKeyPress(e)}
                bssize="lg"
              />
              <Input
                type="password"
                placeholder="Password*"
                name="password"
                onChange={e => this.handleOnChange(e)}
                onKeyPress={e => this.handleKeyPress(e)}
                bssize="lg"
              />
              <Input
                type="email"
                placeholder="Email*"
                name="email"
                onChange={e => this.handleOnChange(e)}
                onKeyPress={e => this.handleKeyPress(e)}
                bssize="lg"
              />
              <Input
                type="passwordHint"
                placeholder="Password Hint"
                name="passwordHint"
                onChange={e => this.handleOnChange(e)}
                onKeyPress={e => this.handleKeyPress(e)}
                bssize="lg"
              />
            </FormGroup>
            <Button onClick={() => this.signUp()} color="primary" size="lg" block>
              Sign up
            </Button>
            <div>*Required</div>
          </div>
        )}
      </div>
    );
  }
}
