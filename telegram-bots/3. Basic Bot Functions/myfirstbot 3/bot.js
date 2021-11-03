const Telegraf = require('telegraf');

const bot = new Telegraf('933371790:AAGzNxMNa6JuCv4P5Xfnkecm51nEtfyZkHI');

bot.start((ctx) => {
  ctx.reply(ctx.from.first_name + " have entered the start command and it is a " + ctx.updateSubTypes[0]);
  // console.log(ctx);
  console.log(ctx.from);
  console.log(ctx.chat);
  console.log(ctx.message);
  console.log(ctx.updateSubTypes);
})

bot.help((ctx) => {
  ctx.reply("You have entered the help command");
})

bot.settings((ctx) => {
  ctx.reply("You have entered the settings command");
})

bot.launch();