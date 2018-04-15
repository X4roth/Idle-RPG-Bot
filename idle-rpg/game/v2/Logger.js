const BaseLogger = require('../core/BaseLogger');

// All logging applied here
class Logger extends BaseLogger {

  constructor(message) {
    super();

    this.message = message;
  }

  logMovement(data) {
    const { player, previousMap, newMap } = data;
    const eventLog = `Moved ${newMap.direction} from ${previousMap.name} and arrived in ${newMap.map.name}`;
    return this.log(player, eventLog, 'pastEvents')
      .then(updatedPlayer => this.message.generateMovementMessage({ updatedPlayer, previousMap, newMap }));
  }

}
module.exports = Logger;
