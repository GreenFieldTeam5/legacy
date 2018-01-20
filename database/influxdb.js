const Influx = require('influx');
const influx = new Influx.InfluxDB({
 host: 'localhost',
 database: 'bodyclock',
 schema: [
   {
     measurement: 'keystroke_times',
     fields: {
       user_id: Influx.FieldType.STRING,
       keystroke_duration: Influx.FieldType.FLOAT,
       current_timezone: Influx.FieldType.STRING,
       millisecondsAfterMidnightLocalTime: Influx.FieldType.FLOAT
     },
     tags: [
       'host'
     ]
   }
 ]
})


  const writeLatestKeystrokeToDb = async function (keystrokeObject) {
    const {
      user_id,
      keystroke_duration,
      millisecondsAfterMidnightLocalTime,
      current_timezone,
    } = keystrokeObject;

    console.log('Keystroke at ms time has started: ', millisecondsAfterMidnightLocalTime);

    await influx.writePoints([
      {
        measurement: 'keystroke_times',
        tags: { host: 'Toms Mac' },
        fields: { user_id: user_id, keystroke_duration: keystroke_duration, current_timezone: current_timezone, millisecondsAfterMidnightLocalTime: millisecondsAfterMidnightLocalTime },
      }
    ]);

    console.log('Keystroke at ms time has finished: ', millisecondsAfterMidnightLocalTime);
  };


// influx.writePoints([
//   {
//     measurement: 'keystroke_times',
//     tags: { host: 'Toms Mac' },
//     fields: { user_id: 1, keystroke_duration: 2, current_timezone: 'America/Los_Angeles', millisecondsAfterMidnightLocalTime: 1610 },
//   }
// ]).then(() => {
//   return influx.query(`
//     select * from keystroke_times
//     where host = 'Toms Mac'
//     order by time desc
//     limit 10
//   `)
// }).then(rows => {
//   rows.forEach(row => console.log(`A keystroke from user_id ${row.user_id} took ${row.keystroke_duration}ms this many minutes after midnight ${row.millisecondsAfterMidnightLocalTime} they were in this timezone: ${row.current_timezone}`))
// });


module.exports = {
  writeLatestKeystrokeToDb,
};
