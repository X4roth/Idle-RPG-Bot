const BaseMessage = require('../core/BaseMessage');
const Database = require('../../database/Database');

class Message extends BaseMessage {

  constructor() {
    super();

    this.Database = new Database();
  }

  generateMovementMessage(data) {
    return new Promise((resolve) => {
      const { updatedPlayer, previousMap, newMap } = data;
      return this.Database.savePlayer(updatedPlayer)
        .then(() => this.generatePlayerName(updatedPlayer))
        .then(playerName => `${playerName} decided to head \`${newMap.direction}\` from \`${previousMap.name}\` and arrived in \`${newMap.map.name}\`.`)
        .then(eventMsg => resolve({ updatedPlayer, eventMsg }));
    });
  }

}
module.exports = Message;
