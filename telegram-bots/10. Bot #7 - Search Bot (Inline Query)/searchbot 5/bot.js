const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('808328592:AAFFUBCK2g7olBWpncLlfsrLh1AQee_sIzk');
const apikey = `8917289-ba8d5b6d020c63e164b48a942`;

// bot.on('inline_query', async ctx => {
//   let query = ctx.inlineQuery.query;
//   let res = await axios.get(`https://pixabay.com/api/?key=${apikey}&q=${query}`);
//   let data = res.data.hits;

//   let results = data.map((item, index) => {
//     return {
//       type: 'photo',
//       id: String(index),
//       photo_url: item.webformatURL,
//       thumb_url: item.previewURL,
//       photo_width: 300,
//       photo_height: 200,
//       caption: `[Source](${item.webformatURL})\n[Large Image](${item.largeImageURL})`,
//       parse_mode: 'Markdown'
//     }
//   })
//   ctx.answerInlineQuery(results)
// })

bot.on('inline_query', async ctx => {
  let query = ctx.inlineQuery.query;
  let res = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&limit=2`);
  let data = res.data;
  let allTitles = data[1];
  let allLinks = data[3];

  if (allTitles == undefined) {
    return;
  }

})

bot.launch();