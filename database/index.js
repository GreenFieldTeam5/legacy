require('dotenv').config();

const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

client
  .connect()
  .then()
  .catch(err => console.error('error connecting to postgres db, ', err.stack));

// create tables needed by server
const initializeDB = () => {
  // initialize tables by reading schema files and running as query
  const schemas = ['/schema/users.sql', '/schema/workspaces.sql', '/schema/bodyclocks.sql'];
  console.log('Is init db running');
  return Promise.all(schemas.map(schema =>
    new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, schema),
        'utf8',
        (err, data) => (err ? reject(err) : resolve(data)),
      );
    }).then(data => client.query(data))));
};

// post message to database
const postMessage = (message, username, workspaceId) =>
  // pull workspace messages table name using workspaceId
  client
    .query('SELECT db_name FROM workspaces WHERE id = $1', [workspaceId])
    // post new message into workspace's messages table
    .then(data =>
      client.query(
        'INSERT INTO $db_name (text, username) VALUES ($1, $2) RETURNING *'.replace(
          '$db_name',
          data.rows[0].db_name,
        ),
        [message, username],
      ));

// get messages for workspace from database
const getMessages = workspaceId =>
  // pull workspace messages table name using workspaceId
  client
    .query('SELECT db_name FROM workspaces WHERE id = $1', [workspaceId])
    // pull messages from workspace's messages table
    .then(data => client.query('SELECT * FROM $db_name'.replace('$db_name', data.rows[0].db_name)))
    .then(data => data.rows);

// post new user to users table in database
const createUser = (username, passhash, email, passhint, clientTimezone) =>
  client.query(
    'INSERT INTO users (username, password, email, password_hint) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, passhash, email, passhint],
  ).then((data) => {
    client.query("INSERT INTO bodyclocks (current_timezone, user_id, total_milliseconds_between_all_keystrokes_00, total_number_keystrokes_00) VALUES ($1, (SELECT id from users WHERE username= $2), $3, $4)", [clientTimezone, username, 23000, 1000])
      .then(() => {
        console.log('What is data: ', data);
        return data.rows[0];
      });
  });

// pull user info from users table in database
const getUser = username =>
  client
    .query('SELECT * FROM users WHERE username = ($1)', [username])
    .then(data => data.rows[0]);

// pull user password hint from users table in database
const getPasswordHint = username =>
  client
    .query('SELECT password_hint FROM users WHERE username = ($1)', [username])
    .then(data => data.rows[0]);

// creates a new workspace
const createWorkspace = (name, dbName = `ws_${name[0]}${Date.now()}`) =>
  // add a new entry into workspaces table
  client.query('INSERT INTO workspaces (name, db_name) VALUES ($1, $2) RETURNING *', [name, dbName])
    .then(() =>
    // read messages schema and insert workspace table name
      new Promise((resolve, reject) => {
        fs.readFile(
          path.join(__dirname, '/schema/messages.sql'),
          'utf8',
          (err, data) => (err ? reject(err) : resolve(data)),
        );
      }))
    // run query to create messages table for workspace
    .then(data => client.query(data.replace('$1', dbName).replace('$1_pk', `${dbName}_pk`)));

// pull list of workspaces from database
const getWorkspaces = () => client.query('SELECT * FROM workspaces').then(data => data.rows);

// pull all emails from users table
const getEmails = () => client.query('SELECT email FROM USERS')
  .then(data => data.rows);

// get all info from slack-bot messages
const getSlackBotWorkspace = () => client.query('SELECT * from slackbot').then(data => data.rows);

const writeLatestKeystrokeToDb = async (keystrokeObject) => {
  const {
    user_id,
    keystroke_duration,
    millisecondsAfterMidnightLocalTime,
    current_timezone,
  } = keystrokeObject;

  client.query(
    'INSERT INTO bodyclocks (current_timezone, user_id, keystroke_duration, milliseconds_after_midnight_local_time) VALUES ($1, $2, $3, $4) RETURNING *', [current_timezone, user_id, keystroke_duration, millisecondsAfterMidnightLocalTime]
    ).then(data => {
      console.log('Data in write latest keystroke: ', data);
    })
};

const getHistoricKeystrokeDurationAtThisTime = async (userId) => {

  const circadianAlertnessOrderedArray = [0.58, 0.58, 0.43, 0.32, 0.0, 0.17, 0.37, 0.61, 0.83, 1.00, 1.00, 1.00, 0.95, 1.00, 1.00, 0.95, 0.83, 0.71, 0.53, 0.53, 0.53, 0.53, 0.53, 0.53];

  // get a 15 minute window either way
  let now = new Date();
  now = now.getTime();
  let midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const msBetweenMidnightAndNow = now - midnight;
  const fifteenMinutesIntoFuture = msBetweenMidnightAndNow + (1000 * 60 * 15);
  const fifteenMinutesIntoPast = msBetweenMidnightAndNow - (1000 * 60 * 15);

  return client.query('SELECT "keystroke_duration" FROM bodyclocks WHERE "milliseconds_after_midnight_local_time" > $1 AND "milliseconds_after_midnight_local_time" < $2 AND "user_id" = $3', [fifteenMinutesIntoPast, fifteenMinutesIntoFuture, userId])
    .then(data => {
      if (data.rows.length === 0) {
        // no individual data fallback to population average
        const hoursBetweenMidnightAndNow = Math.floor(msBetweenMidnightAndNow / (1000 * 60 * 60));
        let alertness = circadianAlertnessOrderedArray[hoursBetweenMidnightAndNow];
        return [undefined, alertness];
      } else {

        // not just a single value but rather a median value for this time of day

        let roughMedianIndex = Math.floor(data.rows.length / 2);
        return [data.rows[roughMedianIndex]['keystroke_duration'], undefined];
      }
    });

}

const getMostAlertKeystrokeDuration = userId => client.query('SELECT keystroke_duration FROM bodyclocks WHERE user_id = $1 ORDER BY keystroke_duration ASC LIMIT 1;', [userId])
  .then(data => data.rows);

const whatPercentageAlertnessAreUsersCurrentlyAt = async (userIdsArray) => {

  let userIdToAlertnessDictionary = {};

  for (let currentUserId of userIdsArray) {
    let historicKeystrokeDurationTuple = await getHistoricKeystrokeDurationAtThisTime(currentUserId);
    let fastestKeystrokesEver = await getMostAlertKeystrokeDuration(currentUserId);
    fastestKeystrokesEver = fastestKeystrokesEver[0]['keystroke_duration'];
    
    let alertness;
    if (historicKeystrokeDurationTuple[0] === undefined) {
      alertness = historicKeystrokeDurationTuple[1];
    } else {
      alertness = fastestKeystrokesEver / historicKeystrokeDurationTuple[0];
    }
    userIdToAlertnessDictionary[currentUserId] = alertness;
  }

  return userIdToAlertnessDictionary;
};

whatPercentageAlertnessAreUsersCurrentlyAt([2, 3]);

// create necessary tables if environment flag INITIALIZEDB is set to true
if (process.env.INITIALIZEDB) {
  initializeDB()
    .then()
    .catch(err => console.error('error creating database tables, ', err.stack));
}

// Get the timezone of every user in the workspace
const getAllTimezonesForWorkspace = () => client.query('SELECT DISTINCT users.username, bodyclocks.current_timezone, users.id FROM users INNER JOIN bodyclocks ON users.id = bodyclocks.user_id').then(data => data.rows);

module.exports = {
  client,
  initializeDB,
  postMessage,
  getMessages,
  createUser,
  getUser,
  createWorkspace,
  getWorkspaces,
  getEmails,
  getPasswordHint,
  getAllTimezonesForWorkspace,
  writeLatestKeystrokeToDb,
  whatPercentageAlertnessAreUsersCurrentlyAt,
};
