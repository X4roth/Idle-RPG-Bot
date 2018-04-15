class BaseLogger {

  log(player, log, eventType) {
    return new Promise((resolve) => {
      if (player[eventType].length === 99) {
        player[eventType].shift();
      }
      player[eventType].push({
        event: log,
        timeStamp: new Date().getTime()
      });

      return resolve(player);
    });
  }

}
module.exports = BaseLogger;
