import MyPromise = require('../src/index');
// new MyPromise<string>(resolve => {
//   setTimeout(() => {
//     resolve('hello');
//   });
// })
//   .then(str => {
//     return str.length;
//   })
//   .then(num => {
//     console.log('🤓🤔😓: num', num);
//     throw new Error('oops!');
//   })
//   .catch(error => {
//     console.log(error);
//   });

Promise.prototype.then;
Promise.resolve;
Promise.all;
MyPromise.reject(`hehe`).catch(reason => {
  console.log('🤓🤔😓: reason', reason);
});
MyPromise.resolve(MyPromise.resolve(111)).then(value => {
  console.log(value);
});
Promise.reject;
