const BaseGame = require('../core/BaseGame');
const Map = require('./Map');

// All logic applied here
class Event extends BaseGame {

  constructor(logger) {
    super();

    this.logger = logger;
    this.Map = new Map();
  }

  moveEvent(player) {
    const previousMap = player.map;
    return this.Map.moveToRandomMap(player)
      .then(newMap => this.logger.logMovement({ player, previousMap, newMap }));
  }

  attackEvent() {

  }

  luckEvent() {

  }

}
module.exports = Event;
