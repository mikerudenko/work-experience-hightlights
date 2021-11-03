const Telegraf = require('telegraf');

const bot = new Telegraf('933371790:AAGzNxMNa6JuCv4P5Xfnkecm51nEtfyZkHI');

bot.use((ctx, next) => {
  ctx.reply("You used the bot");
  next(ctx);
})

bot.start((ctx) => {
  ctx.reply("Start command");
})

bot.launch();