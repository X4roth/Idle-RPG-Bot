require('dotenv').config();

const express = require('express');
const router = require('./web/routes/index');
const discord = require('./idle-rpg/v1/bots/discord');

const app = express();
const { errorLog } = require('./idle-rpg/v1/utils/logger');
const { PORT } = process.env;

console.log(`${process.env.NODE_ENV.includes('production') ? 'Running Production Env' : 'Running Development Env'}`);

// Preperation for the website that allows others to let this bot join their discord!
app.set('views', `${__dirname}/views`);
app.use('/', router);
app.listen(PORT, () => console.log(`Idle RPG web listening on port ${PORT}!`));

process.on('unhandledRejection', (err) => {
  console.log(err);
  errorLog.error({ err });
});
