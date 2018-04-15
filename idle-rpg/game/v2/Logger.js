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

  logSellInTown(data) {
    const { player, profit } = data;
    const eventLog = `Made ${profit} gold selling what you found adventuring`;
    return this.log(player, eventLog, 'pastEvents')
      .then(updatedPlayer => this.message.generateSellinTownMessage({ updatedPlayer, profit }));
  }

  defenderSteal(data) {
    const { battleResults, stealingPlayer, victimPlayer, stolen } = data;
    const battleEventLog = `Died to ${stealingPlayer.name} in ${stealingPlayer.map.name}.`;
    const battleOtherPlayerLog = `Killed ${victimPlayer.name} in ${victimPlayer.map.name}. [${battleResults.expGainDefender} exp]`;
    let eventLog;
    let otherPlayerLog;
    if (stolen.inclues('gold')) {
      eventLog = `Stole ${stolen} from ${victimPlayer.name}`;
      otherPlayerLog = `${stealingPlayer.name} stole ${stolen} from you`;
    }
    eventLog = `Stole ${victimPlayer.equipment[itemKeys[luckItem]].name}`;
    otherPlayerLog = `${stealingPlayer.name} stole ${victimPlayer.equipment[itemKeys[luckItem]].name} from you`;
    return Promise.all([
      this.log(stealingPlayer, battleOtherPlayerLog, 'pastEvents'),
      this.log(stealingPlayer, battleOtherPlayerLog, 'pastPvpEvents'),
      this.log(stealingPlayer, otherPlayerLog, 'pastEvents'),
      this.log(stealingPlayer, otherPlayerLog, 'pastPvpEvents'),
      this.log(victimPlayer, battleEventLog, 'pastEvents'),
      this.log(victimPlayer, battleEventLog, 'pastPvpEvents'),
      this.log(victimPlayer, eventLog, 'pastEvents'),
      this.log(victimPlayer, eventLog, 'pastPvpEvents')
    ])
      .then(() => this.message.generatePvpDefenderWinMessage({ battleResults, stealingPlayer, victimPlayer, stolen }));
  }

}
module.exports = Logger;
