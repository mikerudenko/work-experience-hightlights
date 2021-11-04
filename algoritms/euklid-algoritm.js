function CGD(number1, number2) {
    if (number2 > number1) {
        throw new new Error('Second parameter should be less than first');
    }

    if (number1 !== 0 && number2 !== 0) {
        let difference = number1 % number2;

        while (difference != 0) {
            number1 = number2;
            number2 = difference;
            difference = number1 % number2;
        }

        return number2;
    } else {
        throw new new Error('Values can\'t be equal to zero');
    }
}

console.log(CGD(72, 18));

var gcd = function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}
