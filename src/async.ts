import Promise = require('./core');

const isPromise = (obj: any): obj is Promise<any> => {
  return !!obj && 'function' == typeof obj.then;
};
const toPromise = <T extends any>(obj: T): T | Promise<T> => {
  return isPromise(obj) ? obj : Promise.resolve(obj);
};
const async = <T, TReturn, TNext>(gen: () => Generator<T, TReturn, TNext>) => {
  const generator = gen();
  return new Promise<TReturn>((resolve, reject) => {
    onFulfilled();
    function onFulfilled(res?: any) {
      var ret = undefined;
      try {
        ret = generator.next(res);
      } catch (error) {
        return reject(error);
      }
      next(ret);
    }
    function onReject(error: any) {
      var ret = undefined;
      try {
        if (generator.throw) {
          ret = generator.throw(error);
        }
      } catch (error) {
        return reject(error);
      }
      next(ret!);
    }
    function next(ret: IteratorResult<any>) {
      if (ret.done) {
        resolve(ret.value);
        return;
      }
      const value = toPromise(ret.value);
      return value.then(onFulfilled, onReject);
    }
  });
};
export = async;
