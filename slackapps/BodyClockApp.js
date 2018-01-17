
const basicInvocation = (messageText) => {
  console.log('Basic invocation of bodyclock app was called');
  console.log('Here is the messageText it got: ', messageText);
  return true;
};

module.exports = {
  basicInvocation,
};
