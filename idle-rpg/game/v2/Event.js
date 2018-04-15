const BaseGame = require('../core/BaseGame');
const Battle = require('./Battle');
const Map = require('./Map');

class Event extends BaseGame {

  constructor(logger) {
    super();

    this.logger = logger;
    this.Battle = new Battle();
    this.Map = new Map();
  }

  moveEvent(player) {
    const previousMap = player.map;
    return this.Map.moveToRandomMap(player)
      .then(newMap => this.logger.logMovement({ player, previousMap, newMap }));
  }

  attackEvent(player, onlinePlayers) {
    return this.randomBetween(0, 100)
      .then((luckDice) => {
        if (this.Map.getTowns().includes(player.map.name) && luckDice <= 30 + (player.stats.luk / 4)) {
          // Sell in town
          if (player.inventory.equipment.length > 0) {
            let profit = 0;
            player.inventory.equipment.forEach((equipment) => {
              profit += Math.floor(equipment.gold);
            });
            player.inventory.equipment.length = 0;
            player.gold.current += profit;
            player.gold.total += profit;
            return this.logger.logSellInTown({ player, profit });
          }
        }

        if (luckDice >= 95 - (player.stats.luk / 4) && !this.Map.getTowns().includes(player.map.name)
          && player.health > (100 + (player.level * 5)) / 4) {
          // Pvp Battle
          this.Battle.pvpBattlePreperation(player, onlinePlayers)
            .then(victimPlayer => victimPlayer ? this.Battle.simulateBattle(player, victimPlayer) : /*attackeventmov */)
            .then(battleResults => this.Battle.pvpResults(battleResults))
            .then(({ result, battleResults, updatedAttacker, updatedDefender }) => {
              switch (result) {
                case 'lost':
                  return this.Battle.steal(result, battleResults, updatedDefender, updatedAttacker);
                case 'fled':
                case 'win':
                  return this.Battle.steal(result, battleResults, updatedAttacker, updatedDefender);
              }
            })
            .then((pvpResults) => {
              const { result, battleResults, stealingPlayer, victimPlayer, stolen } = pvpResults;
              switch (result) {
                case 'lost':
                  return this.logger.defenderSteal({ result, battleResults, stealingPlayer, victimPlayer, stolen });
                case 'fled':
                  return this.logger.pvpFled();
                case 'win':
                  return this.logger.attackerSteal();
              }
            });
        }

        if (!this.Map.getTowns().includes(player.map.name)) {
          if (player.health > (100 + (player.level * 5)) / 4) {
            return // Attack Mob
          }

          return // Camp Event
        }

        return // Luck Item Event
      });
  }

  luckEvent() {

  }

}
module.exports = Event;
