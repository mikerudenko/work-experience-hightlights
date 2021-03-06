
module.exports = (bot) => {
  bot.inlineQuery(/w\s.+/, async ctx => {
    let input = ctx.inlineQuery.query.split(' ');
    input.shift();
    let query = input.join(' ');

    //call wiki api with get request using axios
    let res = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&limit=50`);
    let data = res.data;
    let allTitles = data[1]; //store titles array from data into a variable named allTitles
    let allLinks = data[3]; //store links array from data into a variable named allLinks

    //if user types inline query slow, search query may be empty,
    //this if statement checks if allTitles array is empty, if true then stop the entire inlinequery handler with "return" 
    if (allTitles == undefined) {
      return;
    }

    //process the data using javascript's array map method to loop each element in array and return something as an element in the results array
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
              { text: `Share ${item}`, switch_inline_query: `w ${item}` }
            ]
          ]
        }
      }
    })
    ctx.answerInlineQuery(results);
  })
}
