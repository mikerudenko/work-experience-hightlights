function typeOf() {
    "use strict";
    typeof undefined === 'undefined' // true
    typeof true === 'boolean' //true
    typeof 42 === 'number' // true
    typeof {} === 'object' //true
    typeof Symbol() === 'symbol' //true
    typeof null === "object" // true
    typeof function a(){ /* .. */ } === "function"; // true
    typeof [1,2,3] === "object";

    var a = null;
    (!a && typeof a === "object");

}

function convertingTypes() {
    "use strict";
    let a = [], b = [];
    console.log((a==b) + '' + (a == !b) + '' + (!a==b) + '' + (!a==!b)); // false true true true
    //a==b will be false
    //![] -> !object -> !true -> false
    //[] == false -> true
}

function stringReverse() {
    "use strict";
    //Does not work in this case
    console.log("😊 ^^".split("").reverse().join(""));
}

function numbers() {
    "use strict";
    42..toFixed(3); // Uncommon doesn’t mean bad or wrong.

    42
    .toFixed(3); // this is also valid

    Number.isInteger( 42 );     // true
    Number.isInteger( 42.000 ); // true
    Number.isInteger( 42.3 );   // false

    Number.isSafeInteger( Number.MAX_SAFE_INTEGER ); // true
    Number.isSafeInteger( Math.pow( 2, 53 ) ); // false
    Number.isSafeInteger( Math.pow( 2, 53 ) - 1 ); // true
}

function isNegZero() {
    "use strict";
    let isNeg0 = (x)=> {
        return x === 0 && (1/x)=== -Infinity;
    };

    isNeg0(0 / -3); //true
    isNeg0(0 / 3); //false

    Object.is(0, -0) // false
}

function safeGuardOfConditions() {
    "use strict";
    // oops, this would throw an error!
    if (DEBUG) {
        console.log( "Debugging is starting" );
    }
    // this is a safe existence check
    if (typeof DEBUG !== "undefined") {
        console.log( "Debugging is starting" );
    }

    if (typeof atob === "undefined") {
        atob = function() { /*..*/ };
    }

}

function sparceArrays() {
    "use strict";
    var a = [ ];
    a[0] = 1;
    // no `a[1]` slot set here
    a[2] = [ 3 ];
    a[1];       // undefined
    a.length;   // 3


    var a = [ ];
    a["13"] = 42;
    a.length; // 14
}

function immutableStrings() {
    "use strict";
    let a = "foo";

    a[1] = "1";

    a; //foo
}

function isInteger() {
    "use strict";
    Number.isInteger( 42 );     // true
    Number.isInteger( 42.000 ); // true
    Number.isInteger( 42.3 );   // false
}

function ObjectIsPolyfil() {
    "use strict";
    if (!Object.is) {
        Object.is = function(v1, v2) {
            // testDJ for `-0`
            if (v1 === 0 && v2 === 0) {
                return 1 / v1 === 1 / v2;
            }
            // testDJ for `NaN`
            if (v1 !== v1) {
                return v2 !== v2;
            }
            // everything else
            return v1 === v2;
        };
    }

}

function cantChangeNumberObject(){
    "use strict";
    function foo(x) {
        x = x + 1;
        x; // 3
    }
    var a = 2;
    var b = new Number(a); // or equivalently `Object(a)`
    foo(b);
    console.log(b); // 2, not 3
}

function internalClasses() {
    "use strict";
    Object.prototype.toString.call( [1,2,3] );
    // "[object Array]"
    Object.prototype.toString.call( /regex-literal/i );
    // "[object RegExp]"

    Object.prototype.toString.call( null );
    // "[object Null]"
    Object.prototype.toString.call( undefined );
    // "[object Undefined]"
}

function fakeJoin() {
    "use strict";
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        if (i > 0) {
            str += connector;
        }
        if (arr[i] !== undefined) {
            str += arr[i];
        } }
    return str;
}

var a = new Array( 3 );
fakeJoin( a, "-" ); // "--"

function createWithUndefineds(){
    "use strict";
    var a = Array.apply( null, { length: 3 } );
    a; // [ undefined, undefined, undefined ]
}

function prototypesAreNotAlwaysObjects() {
    "use strict";
    typeof Function.prototype; // "function"
    Function.prototype(); // it's an empty function!

    RegExp.prototype.toString(); //"/(?:)/" -- empty regex
    "abc".match( RegExp.prototype ); //[""]

    Array.isArray( Array.prototype ); // true
    Array.prototype.push( 1, 2, 3 ); // 3
    Array.prototype; // [1,2,3]

    // don't leave it that way, though, or expect weirdness!
    // reset the `Array.prototype` to empty
    Array.prototype.length = 0;
}

function Coercion() {
    //This is very interesting function with all of variations of coercion

    "use strict";
    var b = a + "";         // implicit coercion
    var c = String( a );    // explicit coercion

    JSON.stringify( "42" ); // ""42"" (a string with a


    var a = 42;
    var b = String( a );
    var c = "3.14";
    var d = Number( c );
    b; // "42"
    d; // 3.14

    var c = "3.14";
    var d = 5+ +c;
    d; // 8.14

    1 + - + - + + - + 1;  // 2 - <Count of minuses> % 2 == 0 ? + : -

    var d = new Date( "Mon, 18 Aug 2014 08:53:06 CDT" );
    +d; // 1408369986000

    ~42;    // -(42+1) ==> -43


    var a = [1,2];
    var b = [3,4];
    a + b; // "1,23,4"
}

function binaryNotUsageExample() {
    "use strict";

    //Example 1
    var a = "Hello World";

    ~a.indexOf( "lo" ); // -4 //      <-- truthy!

    if (~a.indexOf( "lo" )) { // true
        // found it!
    }
    ~a.indexOf( "ol" ); //0  <-- falsy!
    !~a.indexOf( "ol" ); //true

    if (!~a.indexOf( "ol" )) {  // true
        // not found!
    }


    //Example 2
    Math.floor( -49.6 );    // -50
    ~~-49.6;                // -49

    ~~1E20 / 10; // 166199296
    1E20 | 0 / 10; // 1661992960
    (1E20 | 0) / 10; // 166199296

    parseInt( 1/0, 19 ); // 18
}

function selectorOperators(){
    "use strict";
    var a = 42;
    var b = "abc";
    var c = null;
    a || b; // 42
    a && b;   // "abc"
    c || b; // "abc"
    c && b; // null

    a || b;
    // roughly equivalent to:
    a ? a : b;

    a && b;
    // roughly equivalent to:
    a ? b : a;

}

function notSymbolConverction(){
    "use strict";
    var s1 = Symbol( "cool" );
    String( s1 );     // "Symbol(cool)"
    var s2 = Symbol( "not cool" );
    s2 + "";      // TypeError
}

function parseIntNumberDiff(){
    "use strict";
    var a = "42";
    var b = "42px";
    Number( a );    // 42
    parseInt( a );  // 42
    Number( b );    // NaN
    parseInt( b );  // 42


    parseInt( 0.000008 ); // 0   ("0" from "0.000008")
    parseInt( 0.0000008 ); // 8   ("8" from "8e-7")
    parseInt( false, 16 ); // 250 ("fa" from "false")
    parseInt( parseInt, 16 ); // 15  ("f" from "function..")
    parseInt( "0x10" ); // 16
    parseInt( "103", 2 ); // 2
}

function equaltyOperator(){
    "use strict";
    a == b;     // true
    a == null;  // true
    b == null;  // true

    a == false; // false
    b == false; // false
    a == ""; // false
    b == ""; // false
    a == 0; // false
    b == 0; // false

    "0" == false; //true

    var a = 42;
    var b = [ 42 ];
    a == b; // true


    var a = "abc";
    var b = Object( a ); // same as `new String( a )`
    a === b; // false
    a == b; // true

    var a = null;
    var b = Object( a ); // same as `Object()`
    a == b; // false
    var c = undefined;
    var d = Object( c ); // same as `Object()`
    c == d; // false
    var e = NaN;
    var f = Object( e ); // same as `new Number( e )`
    e == f; // false

    [] == ![];      // true
    0 == "\n";      // true


    42 == "43"; // false
    "foo" == 42; // false
    "true" == true; // false

    42 == "42"; // true
    "foo" == [ "foo" ]; // true
}

function valueOfOperator() {
    "use strict";
    Number.prototype.valueOf = function() {
        return 3;
    };
    new Number( 2 ) == 3;   // true
}

function valueOfEvil(){
    "use strict";
    var i = 2;
    Number.prototype.valueOf = function() {
        return i++;
    };
    var a = new Number( 42 );
    if (a == 2 && a == 3) {
        console.log( "Yep, this happened." );
    }
}

function objectsThroughtParseInt(){
    "use strict";
    var a = {
        num: 21,
        toString: function() { return String( this.num * 2 ); }
    };
    parseInt( a ); // 42
}

function NativesTrap(){
    "use strict";
    var a = new Boolean( false );
    var b = new Number( 0 );
    var c = new String( "" );

    var d = Boolean( a && b && c );
    d; // true
}

function incDecOperations(){
    "use strict";

    function foo() {
        a = a + 1;
    }
    var a = 1;
    foo();      // result: `undefined`, side effect: changed `a`

    var a = 42;
    var b = a++;

    var a = 42;
    a++;    // 42
    a;      // 43
    ++a;    // 44
    a;      // 44
}

function matchExample(){
    "use strict";
    function vowels(str) {
        var matches;
        // pull out all the vowels
        if (str && (matches = str.match( /[aeiou]/g ))) {
            return matches;
        }
    }
}

function TemporaryDeadZone(){
    "use strict";

    {
        typeof a; // undefined
        typeof b; // ReferenceError! (TDZ)
        let b;
    }
}
