require('dotenv').config();
const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TOKEN);
//pixabay's api key
const apikey = process.env.PIXABAYAPI;

const startCommand = require('./src/commands/start');
startCommand(bot);

const startHandler = require('./src/inlinehandlers/start');
startHandler(bot);

const imageHandler = require('./src/inlinehandlers/image');
imageHandler(bot);

const wikiHandler = require('./src/inlinehandlers/wiki');
wikiHandler(bot);

bot.launch();