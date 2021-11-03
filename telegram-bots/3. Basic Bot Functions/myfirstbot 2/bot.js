const Telegraf = require('telegraf');

const bot = new Telegraf('933371790:AAGzNxMNa6JuCv4P5Xfnkecm51nEtfyZkHI');

bot.start((ctx) => {
  ctx.reply("You have entered the start command");
})

bot.help((ctx) => {
  ctx.reply("You have entered the help command");
})

bot.settings((ctx) => {
  ctx.reply("You have entered the settings command");
})

bot.launch();