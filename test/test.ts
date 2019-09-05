import MyPromise = require('../src/index');
new MyPromise<string>(resolve => {
  setTimeout(() => {
    resolve('hello');
  });
})
  .then(str => {
    return str.length;
  })
  .then(num => {
    console.log('🤓🤔😓: num', num);
    throw new Error('oops!');
  })
  .catch(error => {
    console.log(error);
  });

Promise.prototype.then;
Promise.resolve;
