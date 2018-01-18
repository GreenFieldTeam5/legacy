const nodemailer = require('nodemailer');

// settings used for nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// sends welcome email to a new user
const sendWelcomeEmail = async (username, email) => {
  try {
    const message = {
      from: `${process.env.EMAIL_USERNAME}`,
      to: email,
      subject: `Welcome to slackk-casa, ${username}!`,
      text: 'Thanks for joining slackk-casa! We hope you have a great time using our service!',
    };
    return await transporter.sendMail(message);
  } catch (err) {
    return console.error(`error sending registration email to ${username} at ${email}, `, err);
  }
};

module.exports = {
  sendWelcomeEmail,
};

// sends an email every ___ to a list of all emails grabbed from the database.
// const parseEmails = (emailList) => {
//   let emails = [];
//   emailList.map(emailObj => {
//     emails.push(emailObj.email);
//   });
//   return emails.join(', ');
// }
//
// new CronJob('* * * * * *', function() {
//   db.getEmails()
//   .then(data => {
//     let emails = parseEmails(data);
//     console.log(emails);
//     let mailOptions = {
//       from : 'slackkcasa@gmail.com',
//       to: emails,
//       subject: 'testing',
//       text: 'test',
//       html: '<p>test</p>',
//     };
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error(error);
//       }
//     });
//   })
//   .catch(err => console.error(err));
// }, null, true, 'America/Los_Angeles');
