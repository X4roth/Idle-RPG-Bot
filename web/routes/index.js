const express = require('express');

const router = express.Router();
const discord = require('../../idle-rpg/bots/discordv2');

router.use((req, res, next) => {
  console.log(Date.now());
  next();
});

router.get('/', (req, res) => {});

module.exports = router;
