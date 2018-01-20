const getTriggerTime = function(quantity, measurement){
    var timeNow = new Date();
    var triggerTime = null;

    if (measurement === 'seconds') {
        triggerTime = new Date(timeNow.setSeconds(timeNow.getSeconds() + quantity));
    } else if (measurement === 'second') {
        triggerTime = new Date(timeNow.setSeconds(timeNow.getSeconds() + 1));
    } else if (measurement === 'minutes') {
        triggerTime = new Date(timeNow.setMinutes(timeNow.getMinutes() + quantity));
    } else if (measurement === 'minute') {
        triggerTime = new Date(timeNow.setMinutes(timeNow.getMinutes() + 1));
    } else if (measurement === 'hours') {
        triggerTime = new Date(timeNow.setHours(timeNow.getHours() + quantity));
    } else if (measurement === 'hour') {
        triggerTime = new Date(timeNow.setHours(timeNow.getHours() + 1));
    }

    return triggerTime;
  }

 module.exports = {
     getTriggerTime
 }