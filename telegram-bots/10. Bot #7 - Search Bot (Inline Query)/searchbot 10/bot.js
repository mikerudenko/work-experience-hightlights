const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('808328592:AAFFUBCK2g7olBWpncLlfsrLh1AQee_sIzk');
const apikey = `8917289-ba8d5b6d020c63e164b48a942`;

bot.command(['start', 'help'], ctx => {
  let message = `
Welcome to Search Bot!
Use the inline mode below
@s300bot p <search image>
@s300bot w <search wiki>
`;
  ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Search Pixabay Image', switch_inline_query_current_chat: 'p ' }
        ],
        [
          { text: 'Search Wiki', switch_inline_query_current_chat: 'w ' }
        ]
      ]
    }
  })
})

bot.inlineQuery(['start', 'help'], ctx => {
  let message = `
Welcome to Search Bot!
Use the inline mode below
@s300bot p <search image>
@s300bot w <search wiki>
  `;

  let results = [
    {
      type: 'article',
      id: '1',
      title: 'Help Reference',
      input_message_content: {
        message_text: message
      },
      description: 'Sends help message on how to use the bot',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Search Pixabay Image', switch_inline_query_current_chat: 'p ' }
          ],
          [
            { text: 'Search Wiki', switch_inline_query_current_chat: 'w ' }
          ]
        ]
      }
    }
  ]

  ctx.answerInlineQuery(results);
})

bot.inlineQuery(/p\s.+/, async ctx => {
  let input = ctx.inlineQuery.query.split(' ');
  input.shift();
  let query = input.join(' ');

  let res = await axios.get(`https://pixabay.com/api/?key=${apikey}&q=${query}`);
  let data = res.data.hits;

  let results = data.map((item, index) => {
    return {
      type: 'photo',
      id: String(index),
      photo_url: item.webformatURL,
      thumb_url: item.previewURL,
      photo_width: 300,
      photo_height: 200,
      caption: `[Source](${item.webformatURL})\n[Large Image](${item.largeImageURL})`,
      parse_mode: 'Markdown'
    }
  })
  ctx.answerInlineQuery(results)
})

bot.inlineQuery(/w\s.+/, async ctx => {
  let input = ctx.inlineQuery.query.split(' ');
  input.shift();
  let query = input.join(' ');

  let res = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&limit=50`);
  let data = res.data;
  let allTitles = data[1];
  let allLinks = data[3];

  if (allTitles == undefined) {
    return;
  }

  let results = allTitles.map((item, index) => {
    return {
      type: 'article',
      id: String(index),
      title: item,
      input_message_content: {
        message_text: `${item}\n${allLinks[index]}`
      },
      description: allLinks[index],
      reply_markup: {
        inline_keyboard: [
          [
            { text: `Share ${item}`, switch_inline_query: `${item}` }
          ]
        ]
      }
    }
  })
  ctx.answerInlineQuery(results);
})

bot.launch();