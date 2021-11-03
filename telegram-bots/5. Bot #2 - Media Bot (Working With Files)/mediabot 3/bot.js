const Telegraf = require('telegraf');
const bot = new Telegraf('1034839420:AAF8aTRMo2BlVOl5kgOrdyhdyAhVBFSSmU4');

bot.command('newyork', ctx => {
  bot.telegram.sendPhoto(ctx.chat.id, {
    source: 'res/newyork.jpg'
  })
})

bot.launch();