const Telegraf = require('telegraf');

const bot = new Telegraf('933371790:AAGzNxMNa6JuCv4P5Xfnkecm51nEtfyZkHI');

//ctx shortcuts vs standard telegram methods
bot.command('start', ctx => {
  // ctx.reply(text, [extra])
  ctx.reply("Hello World"); // ctx method shortcuts does not require chatId
  // bot.telegram.sendMessage(chatId, text, [extra])
  bot.telegram.sendMessage(ctx.chat.id, "Hello World"); //telegram methods requires chatId
})

bot.launch();
