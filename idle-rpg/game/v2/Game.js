const BaseGame = require('../core/BaseGame');

class Game extends BaseGame {

  constructor(event) {
    super();

    this.event = event;
  }

  selectEvent(hooks, player, onlinePlayerList) {
    const randomEvent = Helper.randomBetween();
    switch (0) {
      case 0:
        return this.event.moveEvent(player)
          .then(({ updatedPlayer, eventMsg }) => this.sendMovementMessage(updatedPlayer, eventMsg));
      case 1:
        return this.event.attackEvent();
      case 2:
        return this.event.luckEvent();
    }
  }

}
module.exports = Game;
