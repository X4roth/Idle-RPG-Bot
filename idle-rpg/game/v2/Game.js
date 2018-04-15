const BaseGame = require('../core/BaseGame');
const Helper = require('./utils/Helper');

class Game extends BaseGame {

  constructor(event) {
    super();

    this.event = event;
  }

  selectEvent(selectedPlayer) {
    const randomEvent = Helper.randomBetween();
    switch (randomEvent) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
    }
  }

}
module.exports = Game;