import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, FormGroup } from 'reactstrap';

export default () => {
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
  //<Link> tags direct requests
  return (
    <Container style={styles.body}>
      <Link style={{ textDecoration: 'none' }} to="">
        <h1>slackk-casa</h1>
      </Link>
      <br />
      <FormGroup>
        <Link style={{ textDecoration: 'none' }} to="/login">
          <Button color="primary" bssize="lg" block>
            Log In
          </Button>
        </Link>
        <br />
        <Link style={{ textDecoration: 'none' }} to="/signup">
          <Button color="primary" bssize="lg" block>
            Sign Up
          </Button>
        </Link>
      </FormGroup>
    </Container>
  );
};
