const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('808328592:AAFFUBCK2g7olBWpncLlfsrLh1AQee_sIzk');

const apikey = `8917289-ba8d5b6d020c63e164b48a942`;

bot.on('inline_query', async ctx => {
  let query = ctx.inlineQuery.query;

  let res = await axios.get(`https://pixabay.com/api/?key=${apikey}&q=${query}`);
  let data = res.data.hits;
  console.log(data);

})

bot.launch();