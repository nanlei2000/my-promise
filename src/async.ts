import Promise = require('./core');

const isPromise = (obj: any): obj is Promise<any> => {
  return !!obj && 'function' === typeof obj.then;
};
const toPromise = <T>(obj: T | PromiseLike<T>): Promise<T> => {
  return isPromise(obj) ? obj : Promise.resolve(obj);
};
const async = <T, TReturn, TNext>(
  gen: () => Generator<T, TReturn, TNext>
): Promise<TReturn> => {
  const generator = gen();
  return new Promise<TReturn>((resolve, reject) => {
    onFulfilled();
    function onFulfilled(res?: any): void {
      let ret: any;
      try {
        ret = generator.next(res);
      } catch (error) {
        return reject(error);
      }
      next(ret);
    }
    function onReject(error: any): void {
      let ret: any;
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
