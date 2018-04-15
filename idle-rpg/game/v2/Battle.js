const BaseGame = require('../core/BaseGame');

class Battle extends BaseGame {

  pvpBattlePreperation(player, onlinePlayers) {
    return new Promise((resolve) => {
      if (player.equipment.weapon.name !== enumHelper.equipment.empty.weapon.name) {
        const sameMapPlayers = mappedPlayers.filter(filterPlayer => filterPlayer.name !== player.name
          && onlinePlayers.findIndex(onlinePlayer => (onlinePlayer.discordId === player.discordId)) !== -1
          && player.level <= filterPlayer.level + pvpLevelRestriction && player.level >= filterPlayer.level - pvpLevelRestriction);

        if (sameMapPlayers.length > 0 && player.health > (100 + (player.level * 5)) / 4) {
          return this.randomBetween(0, sameMapPlayers.length - 1)
            .then((randomPlayerIndex) => {
              const randomPlayer = sameMapPlayers[randomPlayerIndex];

              if (player.equipment.weapon.name !== enumHelper.equipment.empty.weapon.name && randomPlayer.equipment.weapon.name !== enumHelper.equipment.empty.weapon.name) {
                return resolve({ randomPlayer });
              }
            });
        }
      }

      return resolve({});
    });
  }

  pvpResults(battleResults) {
    const { attacker, defender, attackerDamage, defenderDamage } = battleResults;
    battleResults.defenderMaxHealth = 100 + (defender.level * 5);
    battleResults.playerMaxHealth = 100 + (attacker.level * 5);

    if (attacker.health <= 0) {
      const expGain = Math.floor(attackerDamage / 8);
      battleResults.expGainDefender = expGainDefender;

      attacker.battles.lost++;
      defender.battles.won++;
      defender.experience.current += expGain;
      defender.experience.total += expGain;

      return resolve({
        result: enumHelper.battle.outcomes.lost,
        battleResults,
        updatedAttacker: attacker,
        updatedDefender: defender
      });
    }

    if (defender.health > 0 && attacker.health > 0) {
      const eventMsg = attackerDamage > defenderDamage
        ? `[\`${attacker.map.name}\`] ${Helper.generatePlayerName(attacker, true)} attacked ${Helper.generatePlayerName(defender, true)} with ${Helper.generateGenderString(attacker, 'his')} ${attacker.equipment.weapon.name} but ${Helper.generateGenderString(defender, 'he')} managed to get away!
${Helper.capitalizeFirstLetter(Helper.generateGenderString(attacker, 'he'))} dealt \`${attackerDamage}\` dmg, received \`${defenderDamage}\` dmg! [HP:${attacker.health}/${playerMaxHealth}]-[${Helper.generatePlayerName(defender, true)} HP:${defender.health}/${defenderMaxHealth}]`
        : `[\`${attacker.map.name}\`] ${Helper.generatePlayerName(attacker, true)} attacked ${Helper.generatePlayerName(defender, true)} with ${Helper.generateGenderString(attacker, 'his')} ${attacker.equipment.weapon.name} but ${Helper.generatePlayerName(defender, true)} was too strong!
${Helper.capitalizeFirstLetter(Helper.generateGenderString(attacker, 'he'))} dealt \`${attackerDamage}\` dmg, received \`${defenderDamage}\` dmg! [HP:${attacker.health}/${playerMaxHealth}]-[${Helper.generatePlayerName(defender, true)} HP:${defender.health}/${defenderMaxHealth}]`;

      const expGainAttacker = Math.floor(defenderDamage / 8);
      const expGainDefender = Math.floor(attackerDamage / 8);
      battleResults.expGainAttacker = expGainAttacker;
      battleResults.expGainDefender = expGainDefender;
      const eventLog = `Attacked ${defender.name} in ${attacker.map.name} with ${attacker.equipment.weapon.name} and dealt ${attackerDamage} damage! [${expGainAttacker} exp]`;
      const otherPlayerLog = `Attacked by ${attacker.name} in ${attacker.map.name} with ${attacker.equipment.weapon.name} and received ${attackerDamage} damage! [${expGainDefender} exp]`;

      attacker.experience.current += expGainAttacker;
      attacker.experience.total += expGainAttacker;
      defender.experience.current += expGainDefender;
      defender.experience.total += expGainDefender;

      return resolve({
        result: enumHelper.battle.outcomes.fled,
        battleResults,
        updatedAttacker: attacker,
        updatedDefender: defender
      });
    }

    const expGain = Math.floor(defenderDamage / 8);
    battleResults.expGainAttacker = expGainAttacker;
    const eventMsg = `[\`${attacker.map.name}\`] ${Helper.generatePlayerName(attacker, true)} just killed \`${defender.name}\` with ${Helper.generateGenderString(attacker, 'his')} \`${attacker.equipment.weapon.name}\`!
${Helper.capitalizeFirstLetter(Helper.generateGenderString(attacker, 'he'))} dealt \`${attackerDamage}\` dmg, received \`${defenderDamage}\` dmg! [HP:${attacker.health}/${playerMaxHealth}]-[${Helper.generatePlayerName(defender, true)} HP:${defender.health}/${defenderMaxHealth}]`;
    const eventLog = `Killed ${defender.name} in ${attacker.map.name}. [${expGain} exp]`;
    const otherPlayerLog = `Died to ${attacker.name} in ${attacker.map.name}.`;

    attacker.battles.won++;
    defender.battles.lost++;
    attacker.experience.current += expGain;
    attacker.experience.total += expGain;

    return resolve({
      result: enumHelper.battle.outcomes.win,
      battleResults,
      updatedAttacker: attacker,
      updatedDefender: defender
    });
  }

  steal(result, battleResults, stealingPlayer, victimPlayer) {
    return this.randomBetween(0, 100)
      .then((luckStealChance) => {
        const chance = Math.floor((victimPlayer.currentBounty * Math.log(1.2)) / 100);
        const canSteal = !Number.isFinite(chance) ? 0 : chance;
        if (luckStealChance > (90 - canSteal)) {
          return this.randomBetween(0, 2)
            .then((luckItem) => {
              const itemKeys = [enumHelper.equipment.types.helmet.position, enumHelper.equipment.types.armor.position, enumHelper.equipment.types.weapon.position];

              if (!['Nothing', 'Fist'].includes(victimPlayer.equipment[itemKeys[luckItem]].name)) {
                let stolenEquip;
                if (victimPlayer.equipment[itemKeys[luckItem]].previousOwners.length > 0) {
                  const lastOwnerInList = victimPlayer.equipment[itemKeys[luckItem]].previousOwners[victimPlayer.equipment[itemKeys[luckItem]].previousOwners.length - 1];
                  const removePreviousOwnerName = victimPlayer.equipment[itemKeys[luckItem]].name.replace(`${lastOwnerInList}`, `${victimPlayer.name}`);
                  stolenEquip = victimPlayer.equipment[itemKeys[luckItem]];
                  stolenEquip.name = removePreviousOwnerName;
                } else {
                  stolenEquip = victimPlayer.equipment[itemKeys[luckItem]];
                  stolenEquip.name = `${victimPlayer.name}'s ${victimPlayer.equipment[itemKeys[luckItem]].name}`;
                }
                victimPlayer.stolen++;
                stealingPlayer.stole++;
                if (victimPlayer.equipment[itemKeys[luckItem]].name !== enumHelper.equipment.empty[itemKeys[luckItem]].name) {
                  const oldItemRating = Helper.calculateItemRating(stealingPlayer, stealingPlayer.equipment[itemKeys[luckItem]]);
                  const newItemRating = Helper.calculateItemRating(victimPlayer, victimPlayer.equipment[itemKeys[luckItem]]);
                  if (oldItemRating < newItemRating) {
                    stealingPlayer = Helper.setPlayerEquipment(stealingPlayer, enumHelper.equipment.types[itemKeys[luckItem]].position, stolenEquip);
                    if (victimPlayer.equipment[itemKeys[luckItem]].previousOwners.length > 0) {
                      stealingPlayer.equipment[itemKeys[luckItem]].previousOwners = victimPlayer.equipment[itemKeys[luckItem]].previousOwners;
                      stealingPlayer.equipment[itemKeys[luckItem]].previousOwners.push(victimPlayer.name);
                    } else {
                      stealingPlayer.equipment[itemKeys[luckItem]].previousOwners = [`${victimPlayer.name}`];
                    }
                  } else {
                    stealingPlayer = InventoryManager.addEquipmentIntoInventory(stealingPlayer, stolenEquip);
                  }
                  if (victimPlayer.inventory.equipment.length > 0 && victimPlayer.inventory.equipment.find(equip => equip.position === enumHelper.equipment.types[itemKeys[luckItem]].position) !== undefined) {
                    const equipFromInventory = victimPlayer.inventory.equipment.filter(equipment => equipment.position === enumHelper.equipment.types[itemKeys[luckItem]].position)
                      .sort((item1, item2) => item2.power - item1.power)[0];
                    victimPlayer = Helper.setPlayerEquipment(victimPlayer, enumHelper.equipment.types[itemKeys[luckItem]].position, equipFromInventory);
                  } else {
                    victimPlayer = Helper.setPlayerEquipment(victimPlayer, enumHelper.equipment.types[itemKeys[luckItem]].position, enumHelper.equipment.empty[itemKeys[luckItem]]);
                  }
                }
              }

              return resolve({ result, battleResults, stealingPlayer, victimPlayer, stolen: stolenEquip });
            });
        } else if (victimPlayer.gold.current > victimPlayer.gold.current / 6) {
          const goldStolen = Math.round(victimPlayer.gold.current / 6);
          if (goldStolen !== 0) {
            stealingPlayer.gold.current += goldStolen;
            stealingPlayer.gold.total += goldStolen;
            stealingPlayer.gold.stole += goldStolen;

            victimPlayer.gold.current -= goldStolen;
            victimPlayer.gold.stolen += goldStolen;

            return resolve({ result, battleResults, stealingPlayer, victimPlayer, stolen: `${goldStolen} gold` });
          }
        }
      });
  }
}

simulateBattle(attacker, defender) {
  return new Promise((resolve) => {
    const maxRounds = 5;
    const battleResults = [];
    for (let round = 1; round <= maxRounds; round++) {
      battleResults.push(
        this.round(attacker, defender)
      );
      if (attacker.health <= 0 || defender.health <= 0) {
        break;
      }
    }

    return Promise.all(battleResults)
      .then((results) => {
        let attackerDamage = 0;
        let defenderDamage = 0;
        results.forEach((result) => {
          attackerDamage += result.attackerDamage ? result.attackerDamage : 0;
          defenderDamage += result.defenderDamage ? result.defenderDamage : 0;
        });
        if (attacker.health < 0) {
          attacker.health = 0;
        }
        if (defender.health < 0) {
          defender.health = 0;
        }

        return resolve({ attacker, defender, attackerDamage, defenderDamage });
      });
  });
}

initialAttack(attacker, defender) {
  const attackerInitialAttackChance = this.isMonster(attacker)
    ? attacker.stats.dex + (attacker.stats.luk / 2)
    : this.Helper.sumPlayerTotalDexterity(attacker) + (this.Helper.sumPlayerTotalLuck(attacker) / 2);
  const defenderInitialAttackChance = this.isMonster(defender)
    ? defender.stats.dex + (defender.stats.luk / 2)
    : this.Helper.sumPlayerTotalDexterity(defender) + (this.Helper.sumPlayerTotalLuck(defender) / 2);
  if (attackerInitialAttackChance >= defenderInitialAttackChance) {
    return attacker;
  }

  return defender;
}

round(attacker, defender) {
  const battleStats = {
    attacker: this.getBattleStats(attacker),
    defender: this.getBattleStats(defender)
  };

  return this.battleTurn(attacker, defender, battleStats);
}

battleTurn(attacker, defender, battleStats) {
  const initiative = this.initialAttack(attacker, defender);
  return new Promise((resolve) => {
    let attackerDamage;
    let defenderDamage;
    if (initiative.name === attacker.name) {
      this.Helper.printBattleDebug('\nBattle Initiative is Attacker');
      if (attacker.equipment.weapon.attackType === 'melee' || attacker.equipment.weapon.attackType === 'range') {
        attackerDamage = Math.round(battleStats.attacker.attackPower - (battleStats.defender.defensePower.physicalDefensePower / 100));
        if (attackerDamage < 0) {
          attackerDamage = 0;
        }

        defender.health -= attackerDamage;
        this.Helper.printBattleDebug(`HEALTH ${defender.health + attackerDamage} -> ${defender.health}`);
      } else {
        attackerDamage = Math.round(battleStats.attacker.attackPower - (battleStats.defender.defensePower.magicDefensePower / 100));
        if (attackerDamage < 0) {
          attackerDamage = 0;
        }

        defender.health -= attackerDamage;
        this.Helper.printBattleDebug(`HEALTH ${defender.health + attackerDamage} -> ${defender.health}`);
      }

      this.Helper.printBattleDebug(`Attacker Damage: ${attackerDamage}`);
      if (defender.health <= 0) {
        return resolve({ attacker, defender, attackerDamage, defenderDamage });
      }

      if (defender.equipment.weapon.attackType === 'melee' || defender.equipment.weapon.attackType === 'range') {
        defenderDamage = Math.round(battleStats.defender.attackPower - (battleStats.attacker.defensePower.physicalDefensePower / 100));
        if (defenderDamage < 0) {
          defenderDamage = 0;
        }

        attacker.health -= defenderDamage;
        this.Helper.printBattleDebug(`HEALTH ${attacker.health + defenderDamage} -> ${attacker.health}`);
      } else {
        defenderDamage = Math.round(battleStats.defender.attackPower - (battleStats.attacker.defensePower.magicDefensePower / 100));
        if (defenderDamage < 0) {
          defenderDamage = 0;
        }

        attacker.health -= defenderDamage;
        this.Helper.printBattleDebug(`HEALTH ${attacker.health + defenderDamage} -> ${attacker.health}`);
      }

      this.Helper.printBattleDebug(`Defender Damage: ${defenderDamage}`);
    } else if (initiative.name === defender.name) {
      this.Helper.printBattleDebug('\nBattle Initiative is Defender');
      if (defender.equipment.weapon.attackType === 'melee' || defender.equipment.weapon.attackType === 'range') {
        defenderDamage = Math.round(battleStats.defender.attackPower - (battleStats.attacker.defensePower.physicalDefensePower / 100));
        if (defenderDamage < 0) {
          defenderDamage = 0;
        }

        attacker.health -= defenderDamage;
        this.Helper.printBattleDebug(`HEALTH ${attacker.health + defenderDamage} -> ${attacker.health}`);
      } else {
        defenderDamage = Math.round(battleStats.defender.attackPower - (battleStats.attacker.defensePower.magicDefensePower / 100));
        if (defenderDamage < 0) {
          defenderDamage = 0;
        }

        attacker.health -= defenderDamage;
        this.Helper.printBattleDebug(`HEALTH ${attacker.health + defenderDamage} -> ${attacker.health}`);
      }

      this.Helper.printBattleDebug(`Defender Damage: ${defenderDamage}`);
      if (attacker.health <= 0) {
        return resolve({ attacker, defender, attackerDamage, defenderDamage });
      }

      if (attacker.equipment.weapon.attackType === 'melee' || attacker.equipment.weapon.attackType === 'range') {
        attackerDamage = Math.round(battleStats.attacker.attackPower - (battleStats.defender.defensePower.physicalDefensePower / 100));
        if (attackerDamage < 0) {
          attackerDamage = 0;
        }

        defender.health -= attackerDamage;
        this.Helper.printBattleDebug(`HEALTH ${defender.health + attackerDamage} -> ${defender.health}`);
      } else {
        attackerDamage = Math.round(battleStats.attacker.attackPower - (battleStats.defender.defensePower.magicDefensePower / 100));
        if (attackerDamage < 0) {
          attackerDamage = 0;
        }

        defender.health -= attackerDamage;
        this.Helper.printBattleDebug(`HEALTH ${defender.health + attackerDamage} -> ${defender.health}`);
      }

      this.Helper.printBattleDebug(`Attacker Damage: ${attackerDamage}`);
    }

    return resolve(this.spellTurn(attacker, defender, battleStats, attackerDamage, defenderDamage));
  });
}

spellTurn(attacker, defender, battleStats, attackerDamage, defenderDamage) {
  return new Promise((resolve) => {
    const initiative = this.initialAttack(attacker, defender);
    if (initiative.name === attacker.name) {
      this.Helper.printBattleDebug('\nSpell Initiative is Attacker');
      if (attacker.spells.length > 0) {
        const attackerRandomSpell = this.Helper.randomBetween(0, attacker.spells.length - 1);
        const attackerSpellToCast = attacker.spells[attackerRandomSpell];
        switch (attackerSpellToCast.type) {
          case 'self':
            if (attackerSpellToCast.name.toLowerCase().includes('heal') && attacker.mana >= attackerSpellToCast.power) {
              attacker.health += attackerSpellToCast.power * 2;
              attacker.mana -= attackerSpellToCast.power;
              this.Helper.printBattleDebug(`${attacker.name} healed for ${attackerSpellToCast.power * 2}
                HEALTH ${attacker.health - (attackerSpellToCast.power * 2)} -> ${attacker.health}`);
              if (attacker.health >= enumHelper.maxHealth(attacker.level)) {
                attacker.health = enumHelper.maxHealth(attacker.level);
              }
              if (defenderDamage > (attackerSpellToCast.power * 2)) {
                defenderDamage -= (attackerSpellToCast.power * 2);
              }
            }
            break;
          case 'target':
            if (attackerSpellToCast.name.toLowerCase().includes('fireball') && attacker.mana >= attackerSpellToCast.power) {
              let spellDamage = Math.round((attackerSpellToCast.power * 2) - battleStats.defender.defensePower.magicDefensePower);
              if (spellDamage < 0) {
                spellDamage = 0;
              }
              defenderDamage += spellDamage;
              defender.health -= spellDamage;
              attacker.mana -= attackerSpellToCast.power;
              this.Helper.printBattleDebug(`${defender.name} took a fireball to the face for ${spellDamage} damage
                HEALTH ${defender.health + spellDamage} -> ${defender.health}`);
            }
            break;
        }
      }
      if (defender.spells.length > 0) {
        const defenderRandomSpell = this.Helper.randomBetween(0, defender.spells.length - 1);
        const defenderSpellToCast = defender.spells[defenderRandomSpell];
        switch (defenderSpellToCast.type) {
          case 'self':
            if (defenderSpellToCast.name.toLowerCase().includes('heal') && defender.mana >= defenderSpellToCast.power) {
              defender.health += defenderSpellToCast.power * 2;
              defender.mana -= defenderSpellToCast.power;
              this.Helper.printBattleDebug(`${defender.name} healed for ${defenderSpellToCast.power * 2}
                HEALTH ${defender.health - (defenderSpellToCast.power * 2)} -> ${defender.health}`);
              if (defender.health >= enumHelper.maxHealth(defender.level)) {
                defender.health = enumHelper.maxHealth(defender.level);
              }
              if (attackerDamage > (defenderSpellToCast.power * 2)) {
                attackerDamage -= (defenderSpellToCast.power * 2);
              }
            }
            break;
          case 'target':
            if (defenderSpellToCast.name.toLowerCase().includes('fireball') && defender.mana >= defenderSpellToCast.power) {
              let spellDamage = Math.round((defenderSpellToCast.power * 2) - battleStats.attacker.defensePower.magicDefensePower);
              if (spellDamage < 0) {
                spellDamage = 0;
              }
              attackerDamage += spellDamage;
              attacker.health -= spellDamage;
              defender.mana -= defenderSpellToCast.power;
              this.Helper.printBattleDebug(`${attacker.name} took a fireball to the face for ${spellDamage} damage
                HEALTH ${attacker.health + spellDamage} -> ${attacker.health}`);
            }
            break;
        }
      }
    } else if (initiative.name === defender.name) {
      this.Helper.printBattleDebug('\nSpell Initiative is Defender');
      if (defender.spells.length > 0) {
        const defenderRandomSpell = this.Helper.randomBetween(0, defender.spells.length - 1);
        const defenderSpellToCast = defender.spells[defenderRandomSpell];
        switch (defenderSpellToCast.type) {
          case 'self':
            if (defenderSpellToCast.name.toLowerCase().includes('heal') && defender.mana >= defenderSpellToCast.power) {
              defender.health += defenderSpellToCast.power * 2;
              defender.mana -= defenderSpellToCast.power;
              this.Helper.printBattleDebug(`${defender.name} healed for ${defenderSpellToCast.power * 2}
                HEALTH ${defender.health - (defenderSpellToCast.power * 2)} -> ${defender.health}`);
              if (defender.health >= enumHelper.maxHealth(defender.level)) {
                defender.health = enumHelper.maxHealth(defender.level);
              }
              if (attackerDamage > (defenderSpellToCast.power * 2)) {
                attackerDamage -= (defenderSpellToCast.power * 2);
              }
            }
            break;
          case 'target':
            if (defenderSpellToCast.name.toLowerCase().includes('fireball') && defender.mana >= defenderSpellToCast.power) {
              let spellDamage = Math.round((defenderSpellToCast.power * 2) - battleStats.attacker.defensePower.magicDefensePower);
              if (spellDamage < 0) {
                spellDamage = 0;
              }
              attackerDamage += spellDamage;
              attacker.health -= spellDamage;
              defender.mana -= defenderSpellToCast.power;
              this.Helper.printBattleDebug(`${attacker.name} took a fireball to the face for ${spellDamage} damage
                HEALTH ${attacker.health + spellDamage} -> ${attacker.health}`);
            }
            break;
        }
      }
      if (attacker.spells.length > 0) {
        const attackerRandomSpell = this.Helper.randomBetween(0, attacker.spells.length - 1);
        const attackerSpellToCast = attacker.spells[attackerRandomSpell];
        switch (attackerSpellToCast.type) {
          case 'self':
            if (attackerSpellToCast.name.toLowerCase().includes('heal') && attacker.mana >= attackerSpellToCast.power) {
              attacker.health += attackerSpellToCast.power * 2;
              attacker.mana -= attackerSpellToCast.power;
              this.Helper.printBattleDebug(`${attacker.name} healed for ${attackerSpellToCast.power * 2}
                HEALTH ${attacker.health - (attackerSpellToCast.power * 2)} -> ${attacker.health}`);
              if (attacker.health >= enumHelper.maxHealth(attacker.level)) {
                attacker.health = enumHelper.maxHealth(attacker.level);
              }
              if (defenderDamage > (attackerSpellToCast.power * 2)) {
                defenderDamage -= (attackerSpellToCast.power * 2);
              }
            }
            break;
          case 'target':
            if (attackerSpellToCast.name.toLowerCase().includes('fireball') && attacker.mana >= attackerSpellToCast.power) {
              let spellDamage = Math.round((attackerSpellToCast.power * 2) - battleStats.defender.defensePower.magicDefensePower);
              if (spellDamage < 0) {
                spellDamage = 0;
              }
              defenderDamage += spellDamage;
              defender.health -= spellDamage;
              attacker.mana -= attackerSpellToCast.power;
              this.Helper.printBattleDebug(`${defender.name} took a fireball to the face for ${spellDamage} damage
                HEALTH ${defender.health + spellDamage} -> ${defender.health}`);
            }
            break;
        }
      }
    }

    return resolve(this.inventoryTurn(attacker, defender, battleStats, attackerDamage, defenderDamage));
  });
}

inventoryTurn(attacker, defender, battleStats, attackerDamage, defenderDamage) {
  return new Promise((resolve) => {
    const initiative = this.initialAttack(attacker, defender);
    if (initiative.name === attacker.name) {
      this.Helper.printBattleDebug('\nInventory Initiative is Attacker');
      const attackerPotions = attacker.inventory.items.filter(item => item.name.includes('Health Potion'));
      if (attacker.inventory.items.length > 0 && attackerPotions.length > 0) {
        const potion = attackerPotions[this.Helper.randomBetween(0, attackerPotions.length - 1)];
        const healAmount = Math.ceil(potion.power * (attacker.level / 2));
        attacker.health += healAmount;
        if (attacker.health > enumHelper.maxHealth(attacker.level)) {
          attacker.health = enumHelper.maxHealth(attacker.level);
        }
        attacker.inventory.items = attacker.inventory.items.splice(attacker.inventory.items.indexOf(potion), 1);
        if (defenderDamage > healAmount) {
          defenderDamage -= healAmount;
        }

        this.Helper.printBattleDebug(`${attacker.name} drank a health potion and healed ${healAmount} health`);
      }
      const defenderPotions = defender.inventory.items.filter(item => item.name.includes('Health Potion'));
      if (defender.inventory.items.length > 0 && defenderPotions.length > 0) {
        const potion = defenderPotions[this.Helper.randomBetween(0, defenderPotions.length - 1)];
        const healAmount = Math.ceil(potion.power * (defender.level / 2));
        defender.health += healAmount;
        if (defender.health > enumHelper.maxHealth(defender.level)) {
          defender.health = enumHelper.maxHealth(defender.level);
        }
        defender.inventory.items = defender.inventory.items.splice(defender.inventory.items.indexOf(potion), 1);
        if (attackerDamage > healAmount) {
          attackerDamage -= healAmount;
        }

        this.Helper.printBattleDebug(`${defender.name} drank a health potion and healed ${healAmount} health`);
      }
    } else if (initiative.name === defender.name) {
      this.Helper.printBattleDebug('\nInventory Initiative is defender');
      const defenderPotions = defender.inventory.items.filter(item => item.name.includes('Health Potion'));
      if (defender.inventory.items.length > 0 && defenderPotions.length > 0) {
        const potion = defenderPotions[this.Helper.randomBetween(0, defenderPotions.length - 1)];
        const healAmount = Math.ceil(potion.power * (defender.level / 2));
        defender.health += healAmount;
        if (defender.health > enumHelper.maxHealth(defender.level)) {
          defender.health = enumHelper.maxHealth(defender.level);
        }
        defender.inventory.items = defender.inventory.items.splice(defender.inventory.items.indexOf(potion), 1);
        if (attackerDamage > healAmount) {
          attackerDamage -= healAmount;
        }

        this.Helper.printBattleDebug(`${defender.name} drank a health potion and healed ${healAmount} health`);
      }
      const attackerPotions = attacker.inventory.items.filter(item => item.name.includes('Health Potion'));
      if (attacker.inventory.items.length > 0 && attackerPotions.length > 0) {
        const potion = attackerPotions[this.Helper.randomBetween(0, attackerPotions.length - 1)];
        const healAmount = Math.ceil(potion.power * (attacker.level / 2));
        attacker.health += healAmount;
        if (attacker.health > enumHelper.maxHealth(attacker.level)) {
          attacker.health = enumHelper.maxHealth(attacker.level);
        }
        attacker.inventory.items = attacker.inventory.items.splice(attacker.inventory.items.indexOf(potion), 1);
        if (defenderDamage > healAmount) {
          defenderDamage -= healAmount;
        }

        this.Helper.printBattleDebug(`${defender.name} drank a health potion and healed ${healAmount} health`);
      }
    }

    return resolve({ attacker, defender, attackerDamage, defenderDamage });
  });
}

// BATTLE FUNCS
getBattleStats(player) {
  const attackPower = this.calculateAttack(player);
  const defensePower = this.calculateDefense(player);

  return { attackPower, defensePower };
}

calculateAttack(player) {
  let attackPower;
  this.Helper.printBattleDebug(`${player.name} - ${player.equipment.weapon.name} - ${player.equipment.weapon.attackType} - ${player.equipment.weapon.power}`);
  switch (player.equipment.weapon.attackType) {
    case 'melee':
      attackPower = this.isMonster(player)
        ? (player.stats.str + player.equipment.weapon.power + player.power) + (player.stats.dex + (player.stats.luk + (this.Helper.randomBetween(1, player.stats.str) / 2)))
        : (this.Helper.sumPlayerTotalStrength(player) + player.equipment.weapon.power)
        + (this.Helper.sumPlayerTotalDexterity(player)
          + ((this.Helper.sumPlayerTotalLuck(player)
            + this.Helper.randomBetween(1, this.Helper.sumPlayerTotalStrength(player))) / 2));
      break;
    case 'range':
      attackPower = this.isMonster(player)
        ? (player.stats.dex + player.equipment.weapon.power + player.power) + (player.stats.dex + (player.stats.luk + (this.Helper.randomBetween(1, player.stats.dex) / 2)))
        : (this.Helper.sumPlayerTotalDexterity(player) + player.equipment.weapon.power)
        + (this.Helper.sumPlayerTotalDexterity(player)
          + ((this.Helper.sumPlayerTotalLuck(player)
            + this.Helper.randomBetween(1, this.Helper.sumPlayerTotalDexterity(player))) / 2));
      break;
    case 'magic':
      attackPower = this.isMonster(player)
        ? (player.stats.int + player.equipment.weapon.power + player.power) + (player.stats.dex + (player.stats.luk + (this.Helper.randomBetween(1, player.stats.int) / 2)))
        : (this.Helper.sumPlayerTotalIntelligence(player) + player.equipment.weapon.power)
        + (this.Helper.sumPlayerTotalDexterity(player)
          + ((this.Helper.sumPlayerTotalLuck(player)
            + this.Helper.randomBetween(1, this.Helper.sumPlayerTotalIntelligence(player))) / 2));
      break;
  }

  return this.Helper.randomBetween(Math.round(attackPower / 2), attackPower);
}

calculateDefense(player) {
  const physicalDefensePower = this.isMonster(player)
    ? (player.stats.end + player.equipment.armor.power + player.power) + ((player.stats.dex / 2) + (player.stats.luk / 2))
    : (this.Helper.sumPlayerTotalEndurance(player)
      + (player.equipment.armor.power / 2))
    + (this.Helper.sumPlayerTotalDexterity(player) + (this.Helper.sumPlayerTotalLuck(player) / 2));
  const magicDefensePower = this.isMonster(player)
    ? (player.stats.int + player.equipment.armor.power + player.power) + ((player.stats.dex / 2) + (player.stats.luk / 2))
    : (this.Helper.sumPlayerTotalIntelligence(player)
      + (player.equipment.armor.power / 2))
    + (this.Helper.sumPlayerTotalDexterity(player) + (this.Helper.sumPlayerTotalLuck(player) / 2));
  this.Helper.printBattleDebug(`${player.name} - ${physicalDefensePower} - ${magicDefensePower}`);

  return { physicalDefensePower, magicDefensePower };
}

isMonster(obj) {
  return obj.power !== undefined;
}

}
module.exports = Battle;
