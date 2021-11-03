const Telegraf = require('telegraf');

const bot = new Telegraf('919329485:AAHnDgQKUYNhEm2vstEi-gwTeRMI-2y4WRo');

const axios = require('axios');
const fs = require('fs');

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

bot.command('dogbreeds', (ctx) => {
  let rawdata = fs.readFileSync("./dogbreeds.json", "utf8");
  let data = JSON.parse(rawdata);

  let message = "Dog Breeds:\n";
  data.forEach(item => {
    message += `-${item}\n`;
  })

  ctx.reply(message);
})

bot.command("dog", (ctx) => {
  let input = ctx.message.text.split(" ");
  if (input.length != 2) {
    ctx.reply("You must give a dog breed as the second argument");
    return;
  }
  let breedInput = input[1];

  let rawdata = fs.readFileSync("./dogbreeds.json", "utf8");
  let data = JSON.parse(rawdata);

  if (data.includes(breedInput)) {
    axios.get(`https://dog.ceo/api/breed/${breedInput}/images/random`)
      .then(res => {
        ctx.replyWithPhoto(res.data.message);
      }).catch(e => {
        console.log(e);
      })
  }

})

bot.launch();
