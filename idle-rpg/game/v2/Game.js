const BaseGame = require('../core/BaseGame');
const Database = require('../../database/Database');

class Game extends BaseGame {

  constructor(event) {
    super();

    this.database = new Database();
    this.event = event;
  }

  selectEvent(data) {
    const { hooks, player, onlinePlayerList, minTimer, maxTimer } = data;
    // return this.randomBetween()
    //   .then((randomEvent) => { });
    switch (0) {
      case 0:
        return this.database.loadPlayer(player.discordId)
          .then(loadedPlayer => this.event.moveEvent(loadedPlayer))
          .then(eventMsg => this.sendMovementMessage(hooks, eventMsg))
          .then(() => this.randomBetween(minTimer, maxTimer))
          .catch(err => console.log);
      case 1:
        return this.database.loadPlayer(player.discordId, onlinePlayerList)
          .then(loadedPlayer => this.event.attackEvent(loadedPlayer))
          .then(({ eventMsg, battleResults }) => {
            if (battleResults) {
              switch (battleResults.result) {
                case 'lost':
                  return this.sendPvpLostMessage(hooks, eventMsg);
                case 'fled':
                  return this.sendPvpFledMessage(hooks, eventMsg);
                case 'win':
                  return this.sendPvpWonMessage(hooks, eventMsg);
              }
            }
          })
          .then(() => this.randomBetween(minTimer, maxTimer));
      case 2:
        return this.event.luckEvent();
    }
  }

}
module.exports = Game;
