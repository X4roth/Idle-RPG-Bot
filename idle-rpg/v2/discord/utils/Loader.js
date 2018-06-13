const fs = require('fs');
const MessageHandler = require('../modules/MessageHandler');
const { errors } = require('./enumHelper');

class Loader {

  /**
   * Loads all used event emitters from DiscordJS
   * Events from https://discord.js.org/#/docs/main/stable/class/Client
   * @param {*} DiscordBot
   */
  loadEventEmitters(DiscordBot) {
    if (!DiscordBot) {
      // If no DiscordJS Bot object was passed throw custom invalid error
      throw new Error(errors.bot.invalidDiscordJSObj);
    }

    // When Bot has successfully connected.
    DiscordBot.on('ready', () => {
      DiscordBot.user.setAvatar(fs.readFileSync('./idle-rpg/res/hal.jpg'));
      DiscordBot.user.setActivity('Idle-RPG Game Master');
      DiscordBot.user.setStatus('idle');
      console.log('Idle RPG has been loaded!');
    });

    // On bot error
    DiscordBot.on('error', (err) => {
      console.log(err);
    });

    // On received any user message from discord
    DiscordBot.on('message', (msg) => {
      MessageHandler.handle(msg);
    });
  }

}
module.exports = new Loader();
