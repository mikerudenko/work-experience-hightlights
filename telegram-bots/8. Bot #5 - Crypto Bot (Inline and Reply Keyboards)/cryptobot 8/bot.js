const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('1034051091:AAGNbg64_zfmTZtiN-Ee38zcdiZ069h_jhk');

const apikey = "da070e2781369c2446227b7e2cf515cdee789f3d853e03569f40c608492471dd";

bot.command('start', ctx => {
  sendStartMessage(ctx);
})

bot.action('start', ctx => {
  ctx.deleteMessage();
  sendStartMessage(ctx);
})

function sendStartMessage(ctx) {
  let startMessage = `Welcome, this bot gives you cryptocurrency information`;
  bot.telegram.sendMessage(ctx.chat.id, startMessage,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Crypto Prices", callback_data: 'price' }
          ],
          [
            { text: "CoinMarketCap", url: 'https://coinmarketcap.com/' }
          ]
        ]
      }
    })
}

bot.action('price', ctx => {
  let priceMessage = `Get Price Information. Select one of the cryptocurrencies below`;
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, priceMessage,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "BTC", callback_data: 'price-BTC' },
            { text: "ETH", callback_data: 'price-ETH' }
          ],
          [
            { text: "BCH", callback_data: 'price-BCH' },
            { text: "LTC", callback_data: 'price-LTC' }
          ],
          [
            { text: "Back to Menu", callback_data: 'start' },
          ],
        ]
      }
    })
})

bot.launch();