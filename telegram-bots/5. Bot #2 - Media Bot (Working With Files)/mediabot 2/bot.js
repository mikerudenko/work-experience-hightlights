const Telegraf = require('telegraf');
const bot = new Telegraf('1034839420:AAF8aTRMo2BlVOl5kgOrdyhdyAhVBFSSmU4');

bot.command('test', ctx => {
  //url
  bot.telegram.sendPhoto(ctx.chat.id, "https://cdn.pixabay.com/photo/2014/08/01/15/51/manhattan-407703_1280.jpg");

  //file path
  bot.telegram.sendPhoto(ctx.chat.id, { source: "res/london.jpg" })

  //file id
  bot.telegram.sendPhoto(ctx.chat.id, "AgADAQAD8qkxG-gGOETJTldeaW3dkWUTFDAABAEAAwIAA3gAA9pFBQABFgQ")
})

bot.launch();