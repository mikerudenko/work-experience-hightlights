var theThing = null
var replaceThing = function () {
  var originalThing = theThing
  var unused = function () {
    if (originalThing) // ссылка на originalThing
      console.log('hi')
  }
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log('message')
    }
  }
}
setInterval(replaceThing, 1000)
