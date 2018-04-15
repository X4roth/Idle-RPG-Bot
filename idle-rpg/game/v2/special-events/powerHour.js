const { CronJob } = require('cron');

const powerHourWarnTime = '00 30 13 * * 0-6'; // 1pm every day

new CronJob({
  cronTime: powerHourWarnTime,
  onTick: () => {
    game.powerHourBegin();
  },
  start: false,
  timeZone,
  runOnInit: false
}).start();