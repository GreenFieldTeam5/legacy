const bcrypt = require('bcrypt');
const db = require('../database');

// add a user to the database, uses bcrypt to hash password
const addUser = async (username, password, email, passwordHint, clientTimezone) =>
  // insert user into users table with hashed password
  db.createUser(username, await bcrypt.hash(password, 1), email, passwordHint, clientTimezone);

// checks username and password against entries in the database, uses bcrypt to compare hashes
const checkUser = async (username, password) => {
  // pull hashed password from database
  const passhash = (await db.getUser(username)).password;
  // use bcrypt to compare hash if in database, if not username is not in database
  return passhash ? bcrypt.compare(password, passhash) : false;
};


module.exports = {
  addUser,
  checkUser,
};
