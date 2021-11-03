const Telegraf = require('telegraf');

const bot = new Telegraf('919329485:AAHnDgQKUYNhEm2vstEi-gwTeRMI-2y4WRo');

const axios = require('axios');


bot.command('fortune', (ctx) => {
  axios.get('http://yerkee.com/api/fortune')
    .then(res => {
      ctx.reply(res.data.fortune)
    }).catch(e => {
      console.log(e);
    })
})

bot.launch();
