const BaseGame = require('../core/BaseGame');

// All logic applied here
class Event extends BaseGame {

  constructor(logger) {
    super();

    this.logger = logger;
    this.Map = new Map();
  }

  moveEvent(player) {
    const previousMap = player.map;
    const newMap = this.Map.moveToRandomMap(player);

    return this.logger.logMovement({ player, previousMap, newMap });
  }

  attackEvent() {

  }

  luckEvent() {

  }

}
module.exports = Event;
