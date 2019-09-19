import async = require('../src/async');
import Promise = require('../src/core');
const tasks = function*() {
  const value1: number = yield 1;
  const value2: number = yield Promise.resolve(2);
  return [value1, value2];
};

async(tasks).then(res => {
  console.log(res);
});
