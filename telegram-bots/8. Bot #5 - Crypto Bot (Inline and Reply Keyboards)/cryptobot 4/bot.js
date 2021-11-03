const Telegraf = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('1034051091:AAGNbg64_zfmTZtiN-Ee38zcdiZ069h_jhk');

bot.command('test', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, 'Main Menu',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'See Fruits List', callback_data: 'fruits' }
          ],
          [
            { text: 'See Meats List', callback_data: 'meats' }
          ]
        ]
      }
    })
})

bot.action('fruits', ctx => {
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, 'List of fruits:\n-Apples\n-Oranges\n-Pears',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Back to menu', callback_data: 'menu' }
          ]
        ]
      }
    })
})

bot.action('menu', ctx => {
  ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, 'Main Menu',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'See Fruits List', callback_data: 'fruits' }
          ],
          [
            { text: 'See Meats List', callback_data: 'meats' }
          ]
        ]
      }
    })
})

bot.launch();