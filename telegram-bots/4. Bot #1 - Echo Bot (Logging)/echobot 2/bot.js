const Telegraf = require('telegraf');

const bot = new Telegraf('903811813:AAFigToDHW-odYLUW3zzH2Sm3SIKbgfjXtM');

const helpMessage = `
Say something to me
/start - start the bot
/help - command reference
`;

bot.start((ctx) => {
  ctx.reply("Hi I am Echo Bot");
  ctx.reply(helpMessage);
})

bot.help((ctx) => {
  ctx.reply(helpMessage);
})

bot.launch()