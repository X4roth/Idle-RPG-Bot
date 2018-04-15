const BaseMessage = require('../core/BaseMessage');
const Database = require('../../database/Database');

class Message extends BaseMessage {

  constructor() {
    super();

    this.Database = new Database();
  }

  generateMovementMessage(data) {
    const { updatedPlayer, previousMap, newMap } = data;
    const eventMsg = `${this.generatePlayerName(updatedPlayer)} decided to head \`${newMap.direction}\` from \`${previousMap.name}\` and arrived in \`${newMap.map.name}\`.`;
    return this.Database.savePlayer(updatedPlayer)
      .then(this.Promise.resolve({ updatedPlayer, eventMsg }));
  }

}
module.exports = Message;
