const enumHelper = require('../../utils/enumHelper');

class BaseMessage {

  generatePlayerName(player, isAction) {
    return new Promise((resolve) => {
      if (
        player.isMentionInDiscord === 'off'
        || player.isMentionInDiscord === 'action' && !isAction
        || player.isMentionInDiscord === 'move' && isAction
      ) {
        return resolve(`\`${player.name}\``);
      }

      return resolve(`<@!${player.discordId}>`);
    });
  }

  setImportantMessage(message) {
    return `\`\`\`css\n${message}\`\`\``;
  }

  generateGenderString(player, word) {
    return enumHelper.genders[player.gender] ? enumHelper.genders[player.gender][word] : word;
  }

}
module.exports = BaseMessage;