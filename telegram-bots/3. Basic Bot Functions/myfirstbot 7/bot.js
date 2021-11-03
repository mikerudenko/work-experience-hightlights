const Telegraf = require('telegraf');

const bot = new Telegraf('933371790:AAGzNxMNa6JuCv4P5Xfnkecm51nEtfyZkHI');

//handles username eg. @botfather
bot.mention("botfather", (ctx) => {
  ctx.reply("mention method");
})

//handles phone numbers eg. (730) 263-4233, +1 730 263-4233
bot.phone("+1 730 263-4233", (ctx) => {
  ctx.reply("Phone method");
})

//handles hashtags eg. #hash
bot.hashtag("hash", (ctx) => {
  ctx.reply("hashtag method");
})

bot.launch();