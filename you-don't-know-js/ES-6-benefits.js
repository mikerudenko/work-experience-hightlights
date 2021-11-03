// Example 1
let a  = function b(){
    // Will work
    b();
};

b();// Nothing will happen


// Example 2
c = {
    name: '123'
};

c = c.name;

// Example 3
(function(){
    // Some context
})();
// ==
{
    //Some context
}

// Example 4
// We can't work with string like with array of chars

const str = '213465';

str[3] = 'f'; //will not work


// Example 6
function max(a,b,...c) {

}

max.length // 2


// Example 7
// We can not use module.exports
({
    fun1(){
        console.log('123');
    }
})
