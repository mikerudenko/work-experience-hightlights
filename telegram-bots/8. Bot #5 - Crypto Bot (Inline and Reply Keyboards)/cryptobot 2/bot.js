const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('1034051091:AAGNbg64_zfmTZtiN-Ee38zcdiZ069h_jhk');

bot.command('test', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, 'Welcome',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'one', callback_data: 'one' },
            { text: 'one', callback_data: 'one' }
          ],
          [
            { text: 'one', callback_data: 'one' }
          ],
          [
            { text: 'one', callback_data: 'one' },
            { text: 'one', callback_data: 'one' },
            { text: 'one', callback_data: 'one' }
          ]
        ]
      }
    })
})

bot.launch();