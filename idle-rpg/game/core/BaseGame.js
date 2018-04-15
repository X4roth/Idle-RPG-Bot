const Promise = require('bluebird');

class BaseGame {

  constructor() {
    this.Promise = Promise;
  }

  sendMovementMessage(hooks, msg) {
    if (msg.toLowerCase().includes('pyddur')) {
      msg = msg.replace(new RegExp('<@!pyddur>', 'g'), '\`Pyddur, God Of Beer\`');
    }
    return hooks.movementHook.send(msg)
      .catch(err => console.log(err));
  }

  sendPvpLostMessage(hooks, msg) {
    if (msg.toLowerCase().includes('pyddur')) {
      msg = msg.replace(new RegExp('<@!pyddur>', 'g'), '\`Pyddur, God Of Beer\`');
    }
    return hooks.actionHook.send(msg.eventMsg)
      .then(hooks.actionHook.send(msg.stealMsg))
      .catch(err => console.log(err));
  }

  randomBetween(min, max, decimal, exclude) {
    return new Promise((resolve) => {
      // https://stackoverflow.com/questions/15594332/unbiased-random-range-generator-in-javascript
      if (arguments.length < 2) return (Math.random() >= 0.5);

      let factor = 1;
      let result;
      if (typeof decimal === 'number') {
        factor = decimal ** 10;
      }

      do {
        result = (Math.random() * (max - min)) + min;
        result = Math.round(result * factor) / factor;
      } while (result === exclude);
      return resolve(result);
    });
  }

}
module.exports = BaseGame;
