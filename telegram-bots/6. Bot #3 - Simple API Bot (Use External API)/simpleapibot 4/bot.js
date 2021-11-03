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

bot.command('cat', async (ctx) => {
  let input = ctx.message.text;
  let inputArray = input.split(" ");

  if (inputArray.length == 1) {
    try {
      let res = await axios.get('https://aws.random.cat/meow');
      ctx.replyWithPhoto(res.data.file)
    } catch (e) {
      console.log(e);
    }
  } else {
    inputArray.shift();
    input = inputArray.join(" ");
    ctx.replyWithPhoto(`https://cataas.com/cat/says/${input}`);
  }

})

bot.launch();
