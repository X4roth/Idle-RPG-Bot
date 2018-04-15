const Promise = require('bluebird');

class BaseLogger {

  constructor() {
    this.Promise = Promise;
  }

  log(player, log, eventType) {
    if (player[eventType].length === 99) {
      player[eventType].shift();
    }
    player[eventType].push({
      event: msg,
      timeStamp: new Date().getTime()
    });

    return this.Promise.resolve(player);
  }

}
module.exports = BaseLogger;
