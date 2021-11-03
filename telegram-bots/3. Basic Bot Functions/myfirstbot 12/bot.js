const Telegraf = require('telegraf');

const bot = new Telegraf('933371790:AAGzNxMNa6JuCv4P5Xfnkecm51nEtfyZkHI');

//when using extra parameters
bot.command('start', ctx => {

  // bot.telegram.sendMessage(chatId, text, [extra])
  bot.telegram.sendMessage(ctx.chat.id, "Hello World",
    {
      parse_mode: 'Markdown',
      disable_notification: true
    }
  );

  // ctx.reply(text, [extra])
  ctx.reply("Hello World",
    {
      parse_mode: 'Markdown',
      disable_notification: true
    }
  );
})

bot.launch();




