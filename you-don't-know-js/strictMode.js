'use strict';

//1)Can't call with instruction

//2)
var func = function() {
	console.log(this);
};

func(); //this will be not WINDOW , this will be undefined

//3)All variables must be declared

//4)
var object = {};
Object.defineProperty(object,"gender", {
	value:"male",
	writable: false,
	configurable: false
});

console.log(object.gender);
object.gender = "female";
console.log(object.gender); //will be TypeError

//5)
Object.preventExtensions(object);

object.prop = "value"; //will be also error

//6)
delete object.gender; //will be error because configurable: false

//7)will be error
var obj = {
	name: "111",
	name: "222"
}

//8) Нельзя использовать восьмеричные числа
var octal = 0251;
console.log(octal);

//Определение на StrictMode
var hasStrictMode = (function() { "use strict"; return this===undefined}());