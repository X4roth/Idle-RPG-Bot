const Promise = require('bluebird');

class BaseMessage {

  constructor() {
    this.Promise = Promise;
  }

  generatePlayerName(player, isAction) {
    if (
      player.isMentionInDiscord === 'off'
      || player.isMentionInDiscord === 'action' && !isAction
      || player.isMentionInDiscord === 'move' && isAction
    ) {
      return `\`${player.name}\``;
    }

    return `<@!${player.discordId}>`;
  }

}
module.exports = BaseMessage;