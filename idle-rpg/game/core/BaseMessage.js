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

}
module.exports = BaseMessage;