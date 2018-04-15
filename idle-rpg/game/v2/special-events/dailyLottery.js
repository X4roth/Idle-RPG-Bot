const { CronJob } = require('cron');

const dailyLotteryTime = '00 00 10 * * 0-6';

new CronJob({
  cronTime: dailyLotteryTime,
  onTick: () => {
    game.dailyLottery(discordBot, guildName);
  },
  start: false,
  timeZone,
  runOnInit: false
}).start();