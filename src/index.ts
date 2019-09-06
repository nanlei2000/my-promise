import MyPromise_ = require('./core');
// 实现一个promise的延迟对象 defer

class MyPromise<T> extends MyPromise_<T> {
  public static deferred() {
    let dfd: any = {};
    dfd.promise = new MyPromise_((resolve, reject) => {
      dfd.resolve = resolve;
      dfd.reject = reject;
    });
    return dfd;
  }
  public static defer() {
    return MyPromise.deferred();
  }
}

export = MyPromise;
