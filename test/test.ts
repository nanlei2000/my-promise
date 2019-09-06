import MyPromise = require('../src/index');
import assert = require('assert');

(async () => {
  const list = [Promise.resolve(1), Promise.resolve(2)];
  const res1 = await Promise.all(list);
  const res2 = await MyPromise.all(list);
  assert.deepStrictEqual(res1, res2);
})();

(async () => {
  const list = [MyPromise.resolve(1), MyPromise.reject(2)];
  const res1 = await Promise.all(list).catch(error => error);
  const res2 = await MyPromise.all(list).catch(error => error);
  assert.deepStrictEqual(res1, res2);
})();

(async () => {
  const list = [
    new Promise(resolve => {
      setTimeout(() => resolve(1), 1000);
    }),
    new Promise(resolve => {
      setTimeout(() => resolve(0.5), 500);
    }),
  ];
  const res1 = await Promise.race(list);
  const res2 = await MyPromise.race(list);
  assert.deepStrictEqual(res1, res2);
})();
(async () => {
  const list1 = Promise.resolve(Promise.resolve(11));
  const list2 = MyPromise.resolve(MyPromise.resolve(11));
  const res1 = await list1;
  const res2 = await list2;
  assert.deepStrictEqual(res1, res2);
})();
(async () => {
  const res1 = await Promise.reject(1).catch(e => e);
  const res2 = await MyPromise.reject(1).catch(e => e);
  assert.deepStrictEqual(res1, res2);
})();
