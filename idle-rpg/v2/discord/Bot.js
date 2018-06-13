const DiscordJS = require('discord.js');
const Loader = require('./utils/Loader');
const { botLoginToken } = require('../../../settings');

class Bot {

  constructor() {
    this.DiscordBot = new DiscordJS.Client();
    Loader.loadEventEmitters(this.DiscordBot);
    this.DiscordBot.login(botLoginToken);
  }

}
module.exports = new Bot();
