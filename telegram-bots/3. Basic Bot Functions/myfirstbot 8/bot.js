const Telegraf = require('telegraf');

const bot = new Telegraf('933371790:AAGzNxMNa6JuCv4P5Xfnkecm51nEtfyZkHI');

bot.use((ctx) => {
  ctx.reply("You used the bot")
})

bot.launch();