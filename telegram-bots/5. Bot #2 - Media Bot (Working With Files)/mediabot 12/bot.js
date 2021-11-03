const Telegraf = require('telegraf');
const bot = new Telegraf('1034839420:AAF8aTRMo2BlVOl5kgOrdyhdyAhVBFSSmU4');

bot.command(['start', 'help'], ctx => {
  let message = `
Help Reference:
/newyork - get image of New York
/dubai - get gif of Dubai
/singapore - get location of Singapore
/cities - get photos of cities
/citieslist - get text file cities
  `;
  ctx.reply(message);
})

bot.command('newyork', ctx => {
  bot.telegram.sendChatAction(ctx.chat.id, "upload_photo");
  bot.telegram.sendPhoto(ctx.chat.id,
    {
      source: 'res/newyork.jpg'
    },
    {
      reply_to_message_id: ctx.message.message_id
    }
  )
})

bot.command('dubai', ctx => {
  bot.telegram.sendChatAction(ctx.chat.id, "upload_video");
  bot.telegram.sendAnimation(ctx.chat.id,
    "https://media2.giphy.com/media/c0BdI069vyn5K/giphy.gif?cid=790b7611640372d3186cd2314995cb37839375a907f0a08e&rid=giphy.gif",
    {
      reply_to_message_id: ctx.message.message_id
    }
  )
})

bot.command('cities', ctx => {
  let cities = ['res/dubai.jpg', 'res/hongkong.jpg', 'res/london.jpg', 'res/newyork.jpg', 'res/singapore.jpg'];

  let result = cities.map(city => {
    return {
      type: 'photo',
      media: {
        source: city
      }
    }
  })
  bot.telegram.sendMediaGroup(ctx.chat.id, result);
})

bot.command('citieslist', ctx => {
  bot.telegram.sendDocument(ctx.chat.id,
    {
      source: "res/citieslist.txt"
    },
    {
      thumb: { source: "res/dubai.jpg" }
    })
})

bot.command('singapore', ctx => {
  bot.telegram.sendLocation(ctx.chat.id, 1.3521, 103.8198);
})

bot.on('message', async ctx => {
  if (ctx.updateSubTypes[0] == 'document') {
    try {
      let link = await bot.telegram.getFileLink(ctx.message.document.file_id);
      ctx.reply('Your download link: ' + link);
    } catch (err) {
      console.log(err);
      ctx.reply(err.description);
    }
  } else if (ctx.updateSubTypes[0] == 'photo') {
    console.log();
    try {
      let link = await bot.telegram.getFileLink(ctx.message.photo[0].file_id);
      ctx.reply('Your download link: ' + link);
    } catch (err) {
      console.log(err);
      ctx.reply(err.description);
    }
  }
})

bot.launch();