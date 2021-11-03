require('dotenv').config();
const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.TOKEN);

const startCommand = require('./src/commands/start');
startCommand(bot);

const startHandler = require('./src/inlinehandlers/start');
startHandler(bot);

const imageHandler = require('./src/inlinehandlers/image');
imageHandler(bot);

const wikiHandler = require('./src/inlinehandlers/wiki');
wikiHandler(bot);

// bot.launch();

exports.handler = (event, context, callback) => {
  const tmp = JSON.parse(event.body); // get data passed to us
  bot.handleUpdate(tmp); // make Telegraf process that data
  return callback(null, { // return something for webhook, so it doesn't try to send same stuff again
    statusCode: 200,
    body: '',
  });
};