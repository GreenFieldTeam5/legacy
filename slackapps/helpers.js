
const getDynamicTriggerTime = function(quantity, measurement){
    const timeNow = new Date();
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
    console.log(triggerTime);
    return triggerTime;
  }

const getStaticTriggerTime = function(day = new Date().getDate(), hours = new Date().getHours(), mins = new Date().getHours()) {
    const timeNow = new Date();
    
    console.log('day ' + day);
    return triggerTime;
}

 module.exports = {
    getDynamicTriggerTime,
    getStaticTriggerTime,
 }