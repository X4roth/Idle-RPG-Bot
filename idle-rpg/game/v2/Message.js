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
        .then(eventMsg => resolve(eventMsg));
    });
  }

  generateSellInTownMessage(data) {
    return new Promise((resolve) => {
      const { updatedPlayer, profit } = data;
      return this.Database.savePlayer(updatedPlayer)
        .then(() => this.generatePlayerName(updatedPlayer, true))
        .then(playerName => `[\`${updatedPlayer.map.name}\`] ${playerName} just sold what they found adventuring for ${profit} gold!`)
        .then(eventMsg => resolve(eventMsg));
    });
  }

  generatePvpDefenderWinMessage(data) {
    return new Promise((resolve) => {
      const { battleResults, stealingPlayer, victimPlayer, stolen } = data;
      return Promise.all([
        this.generatePlayerName(stealingPlayer, true),
        this.generatePlayerName(victimPlayer, true),
        this.Database.savePlayer(stealingPlayer),
        this.Database.savePlayer(victimPlayer)
      ])
        .then(promiseResults => `[\`${victimPlayer.map.name}\`] ${promiseResults[0]} just killed ${promiseResults[1]} with ${this.generateGenderString(defender, 'his')} \`${stealingPlayer.equipment.weapon.name}\`!
        ${promiseResults[1]} dealt \`${battleResults.attackerDamage}\` dmg, received \`${battleResults.defenderDamage}\` dmg! [${promiseResults[0]} HP:${stealingPlayer.health}/${battleResults.defenderMaxHealth}]`)
        .then((eventMsg) => {
          if (stolen.includes('gold')) {
            return { eventMsg, stealMsg: this.setImportantMessage(`${stealingPlayer.name} just stole ${stolen}!`) };
          }
          return { eventMsg, stealMsg: this.setImportantMessage(`${stealingPlayer.name} just stole ${stolen.name}!`) };
        })
        .then(eventMsg => resolve({ eventMsg, battleResults }));
    });
  }

}
module.exports = Message;
