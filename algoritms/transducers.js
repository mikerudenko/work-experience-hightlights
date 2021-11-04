const mapping = (f) => (reducing) => (result, input) => reducing(result, f(input));
const filtering = (predicate) => (reducing) => (result, input) => predicate(input) ? reducing(result, input) : result;
let arr = [];
for (a = 0; a < 10000000; arr[a++] = a) {}


//example 1
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
.reduce(mapping((x) => x + 1)((xs, x) => {
    xs.push(x);
    return xs;
}), [])
.reduce(filtering((x) => x % 2 === 0)((xs, x) => {
    xs.push(x);
    return xs;
}), []);


//example 2
console.time('test');
arr.reduce(
    mapping(x => {
        return x + 1
    })
    (
        filtering(x => {
            return x % 2 === 0
        })
        ((xs, x) => {
            xs.push(x);
            return xs;
        })
    ),
    []);
console.timeEnd('test');

console.time('test2');
arr.map(x => x + 1).filter(x => x % 2 === 0);
console.timeEnd('test2');
