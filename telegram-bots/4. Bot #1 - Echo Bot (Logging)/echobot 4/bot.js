const Telegraf = require('telegraf');

const bot = new Telegraf('903811813:AAFigToDHW-odYLUW3zzH2Sm3SIKbgfjXtM');

const helpMessage = `
Say something to me
/start - start the bot
/help - command reference
`;

bot.start((ctx) => {
  logger(ctx);
  ctx.reply("Hi I am Echo Bot");
  ctx.reply(helpMessage);
})

bot.help((ctx) => {
  logger(ctx);
  ctx.reply(helpMessage);
})

bot.command("echo", (ctx) => {
  logger(ctx);
  let input = ctx.message.text; //get input from user
  let inputArray = input.split(" "); //split input by spaces
  let message = ""; //create variable for message to output to user

  if (inputArray.length == 1) { //check if array just contains "/echo"
    message = "You said echo";
  } else {
    inputArray.shift(); //remove first element in array - "/echo"
    message = inputArray.join(" "); //join all elements into a string separated by spaces
  }

  ctx.reply(message); //reply message to user
})

function logger(ctx) {
  // console.log("Someone used your bot");
  // console.log(ctx.from);
  console.log(ctx.from.username + " said: " + ctx.message.text);
}

bot.launch();