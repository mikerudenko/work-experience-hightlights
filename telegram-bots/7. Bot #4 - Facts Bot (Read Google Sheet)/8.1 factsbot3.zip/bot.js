const Telegraf = require("telegraf");

const bot = new Telegraf("918062756:AAGWTjxk-EuXddyA0PBP3SG_aieOHIqLqRY");

const axios = require('axios');

let dataStore = [];

getData();

bot.command('fact', ctx => {
  let maxRow = dataStore.filter(item => {
    return (item.row == '1' && item.col == '2');
  })[0].val;

  let k = Math.floor(Math.random() * maxRow) + 1;

  let fact = dataStore.filter(item => {
    return (item.row == k && item.col == '5');
  })[0];

  let message =
    `
Fact #${fact.row}:
${fact.val}
  `;

  ctx.reply(message);
})

async function getData() {
  try {
    let res = await axios('https://spreadsheets.google.com/feeds/cells/1qwunC72mqNN2Vfy2tIiOrwpxOnHn3AnWmLfsf18llIA/1/public/full?alt=json');
    // console.log(res.data.feed.entry);
    let data = res.data.feed.entry;
    dataStore = [];
    data.forEach(item => {
      dataStore.push({
        row: item.gs$cell.row,
        col: item.gs$cell.col,
        val: item.gs$cell.inputValue,
      })
    })
    console.log(dataStore);
  } catch (err) {
    console.log(err);
  }
}

bot.launch();