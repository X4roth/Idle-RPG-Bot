const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');

const Game = require('../game/v2/Game');
const Event = require('../game/v2/Event');
const Logger = require('../game/v2/Logger');
const Message = require('../game/v2/Message');

const message = new Message();
const logger = new Logger(message);
const event = new Event(logger);
const game = new Game(event);

const Helper = require('../game/v2/utils/Helper');
const CommandParser = require('./utils/CommandParser');
const { mockPlayers } = require('../utils/enumHelper');

const commandParser = new CommandParser(Helper);

const {
  actionWebHookId,
  actionWebHookToken,
  moveWebHookId,
  moveWebHookToken,
  welcomeChannelId,
  faqChannelId,
  streamChannelId,
  botLoginToken,
  minimalTimer,
  maximumTimer
} = require('../../settings');

const webHookOptions = {
  apiRequestMethod: 'sequential',
  shardId: 0,
  shardCount: 0,
  messageCacheMaxSize: 200,
  messageCacheLifetime: 0,
  messageSweepInterval: 0,
  fetchAllMembers: false,
  disableEveryone: false,
  sync: false,
  restWsBridgeTimeout: 5000,
  restTimeOffset: 500
};

const discordBot = new Discord.Client();
const actionHook = new Discord.WebhookClient(
  actionWebHookId,
  actionWebHookToken,
  webHookOptions
);

const movementHook = new Discord.WebhookClient(
  moveWebHookId,
  moveWebHookToken,
  webHookOptions
);

const hooks = {
  actionHook,
  movementHook,
  discordBot
};

let minTimer = (minimalTimer * 1000) * 60;
let maxTimer = (maximumTimer * 1000) * 60;
const tickInMinutes = 2;
let onlinePlayerList = [];
let guildName;
const interval = process.env.NODE_ENV.includes('production') ? tickInMinutes : 1;

console.log(`Current ENV: ${process.env.NODE_ENV}`);
if (!process.env.NODE_ENV.includes('production')) {
  console.log('Mock Players loaded');
  onlinePlayerList = mockPlayers;
  guildName = 'Idle-RPG-TEST';
} else {
  onlinePlayerList.push({
    name: 'Pyddur, God of Beer',
    discordId: 'pyddur'
  });
  guildName = 'Idle-RPG';
}

const processDetails = () => {
  let memoryUsage = util.inspect(process.memoryUsage());
  memoryUsage = JSON.parse(memoryUsage.replace('rss', '"rss"').replace('heapTotal', '"heapTotal"').replace('heapUsed', '"heapUsed"').replace('external', '"external"'));

  console.log('------------');
  console.log(`\n\nHeap Usage:\n  RSS: ${(memoryUsage.rss / 1048576).toFixed(2)}MB\n  HeapTotal: ${(memoryUsage.heapTotal / 1048576).toFixed(2)}MB\n  HeapUsed: ${(memoryUsage.heapUsed / 1048576).toFixed(2)}MB`);
  console.log(`Current Up Time: ${Helper.secondsToTimeFormat(Math.floor(process.uptime()))}\n\n`);
  console.log('------------');
};

const heartBeat = () => {
  if (process.env.NODE_ENV.includes('production')) {
    const discordUsers = discordBot.guilds.size > 0
      ? discordBot.guilds.find('name', guildName).members
      : undefined;

    if (discordUsers) {
      const discordOfflinePlayers = discordUsers
        .filter(player => player.presence.status === 'offline' && !player.user.bot)
        .map((player) => {
          return {
            name: player.nickname ? player.nickname : player.displayName,
            discordId: player.id
          };
        });

      const discordOnlinePlayers = discordUsers
        .filter(player => player.presence.status === 'online' && !player.user.bot
          || player.presence.status === 'idle' && !player.user.bot
          || player.presence.status === 'dnd' && !player.user.bot)
        .map((player) => {
          return {
            name: player.nickname ? player.nickname : player.displayName,
            discordId: player.id
          };
        });

      onlinePlayerList = onlinePlayerList.concat(discordOnlinePlayers)
        .filter((player, index, array) =>
          index === array.findIndex(p => (
            p.discordId === player.discordId
          ) && discordOfflinePlayers.findIndex(offlinePlayer => (offlinePlayer.discordId === player.discordId)) === -1));
      onlinePlayerList.forEach(player => discordOfflinePlayers.filter(offPlayer => offPlayer.discordId === player.discordId));
    }
  }

  if (onlinePlayerList.length >= 50) {
    console.log(`MinTimer: ${(minTimer / 1000) / 60} - MaxTimer: ${(maxTimer / 1000) / 60}`);
    minTimer = ((Number(minimalTimer) + (Math.floor(onlinePlayerList.length / 50))) * 1000) * 60;
    maxTimer = ((Number(maximumTimer) + (Math.floor(onlinePlayerList.length / 50))) * 1000) * 60;
  }

  onlinePlayerList.forEach((player) => {
    if (!player.timer) {
      console.log(player.nextTimer);
      player.timer = setTimeout(() => {
        player.nextTimer = game.selectEvent({ hooks, player, onlinePlayerList, minTimer, maxTimer });
        delete player.timer;
      }, player.nextTimer ? player.nextTimer : Math.floor(Math.random() * maxTimer) + minTimer);
    }
  });

  processDetails();
};

discordBot.on('ready', () => {
  discordBot.user.setAvatar(fs.readFileSync('./idle-rpg/res/hal.jpg'));
  discordBot.user.setActivity('Idle-RPG Game Master');
  discordBot.user.setStatus('idle');
  console.log('Idle RPG has been loaded!');

  console.log(`Interval delay: ${interval} minute(s)`);
  setInterval(heartBeat, 60000 * interval);
});

discordBot.on('error', (err) => {
  console.log(err);
  errorLog.error(err);
});

discordBot.on('message', (message) => {
  if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
    return message.reply('┬─┬ノ(ಠ_ಠノ)');
  }

  if (message.attachments && message.attachments.size > 0) {
    const { url } = message.attachments.array()[0];

    return VirusTotal.scanUrl(url)
      .then(VirusTotal.retrieveReport)
      .then((reportResults) => {
        infoLog.info(reportResults);
        if (reportResults.positives > 0) {
          message.delete();
          message.reply('This attachment has been flagged, if you believe this was a false-positive please contact one of the Admins.');
        }
      });
  }

  commandParser.parseUserCommand(game, discordBot, hooks, message);
});

if (streamChannelId && process.env.NODE_ENV.includes('production')) {
  discordBot.on('presenceUpdate', (oldMember, newMember) => {
    if (newMember.presence.game && !oldMember.presence.game) {
      if (newMember.presence.game.streaming && !oldMember.presence.game) {
        newMember.guild.channels.find('id', streamChannelId).send(`${newMember.displayName} has started streaming \`${newMember.presence.game.name}\`! Go check the stream out if you're interested!\n<${newMember.presence.game.url}>`);
      }
    }
  });
}

discordBot.on('guildMemberAdd', (member) => {
  const channel = member.guild.channels.find('id', welcomeChannelId);
  if (!channel) {
    return;
  }

  channel.send(`Welcome ${member}! This channel has an Idle-RPG bot! If you have any questions check the <#${faqChannelId}> or PM me !help.`);
  welcomeLog.welcome(member);
});

discordBot.login(botLoginToken);
console.log(`MinTimer: ${(minTimer / 1000) / 60} - MaxTimer: ${(maxTimer / 1000) / 60}`);

module.exports = discordBot;
