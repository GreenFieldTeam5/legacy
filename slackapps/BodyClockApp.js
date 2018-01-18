
const displayWorkspaceBodyClocks = (messageText, username, workspaceId) => {

};

const displaySpecificBodyClocks = (messageText, username, workspaceId) => {

};

const triageBodyClockRequest = (messageText, username, workspaceId) => {

  // splice the first word off - we're done with that part now we're successfully routed to BodyClockApp.js
  const messageString = messageText.split(' ').slice(1).join(' ');

  if (messageString.includes('@')) {
    // advanced case -- query specific users within the workspace
    displaySpecificBodyClocks(messageText, username, workspaceId);
  } else {
    // basic case -- time of day, and time of circadian rhythm for everyone in the workspace
    displayWorkspaceBodyClocks(messageText, username, workspaceId);
  }

  return true;
};

module.exports = {
  triageBodyClockRequest,
};
