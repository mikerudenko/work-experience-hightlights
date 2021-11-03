function changeGloabalFromFunction () {

  function foo (obj) {
    with (obj) {
      a = 2
    }
  }

  var o1 = {
    a: 3
  }
  var o2 = {
    b: 3
  }
  foo(o1)
  console.log(o1.a) // 2
  foo(o2)
  console.log(o2.a) // undefined
  console.log(a) // 2—Oops, leaked global!
}

function functionLikeParametr () {
  var a = 2;
  (function IIFE (def) {
    def(window)
  })(function def (global) {
    var a = 3
    console.log(a) // 3 console.log( global.a ); // 2
  })

}

function tryCatchBlockScope () {
  try {
    undefined() // illegal operation to force an exception!
  }
  catch (err) {
    console.log(err) // works! }
  }

  console.log(err) // ReferenceError: `err` not found

  //What write programmer
  try {throw 2} catch (a) {
    console.log(a) // 2
  }
  console.log(a) // ReferenceError

  //What interpreter see
  {
    try {
      throw undefined

    } catch (a) {
      a = 2
      console.log(a)
    }
  }
  console.log(a)
}

function explicitBlock () {
  'use strict'
  let foo = true

  if (foo) {
    { //<- explicit block scope
      let bar = foo * 2
      bar = something()
      console.log(bar)
    }
  }
}

function FunctionFirst () {
  'use strict'
  foo() // 1
  var foo

  function foo () {
    console.log(1)
  }

  foo = function () {
    console.log(2)
  }
}


function changeGlobalThroughtFunctions () {
  'use strict'
  var fn

  function foo () {
    var a = 2

    function baz () {
      console.log(a)
    }

    fn = baz // assign baz to global variable
  }

  function bar () {
    fn() // look ma, I saw closure!
  }

  foo()
  bar() // 2
}

