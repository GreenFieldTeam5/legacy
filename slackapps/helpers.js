const getTriggerTime = function(quantity, measurement){
    var timeNow = new Date();
    var triggerTime = null;

    if (measurement === 'seconds') {
        triggerTime = new Date(timeNow.setSeconds(timeNow.getSeconds() + quantity));
    } else if (measurement === 'minutes') {
        triggerTime = new Date(timeNow.setMinutes(timeNow.getMinutes() + quantity));
    }

    return triggerTime;
  }

 module.exports = {
     getTriggerTime
 }