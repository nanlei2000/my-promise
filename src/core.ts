/**
 * http://www.ituring.com.cn/article/66566
 */

enum State {
  PENDING,
  FULFILLED,
  REJECTED,
}

interface Executor<T> {
  (resolve: Resolve<T>, reject: Reject): void;
}
interface Resolve<T> {
  (value?: T): void;
}
interface Reject {
  (reason?: any): void;
}
class MyPromise<T> {
  private state: State = State.PENDING;
  private value: T | undefined = undefined;
  private reason: any = undefined;
  private onResolvedCallbacks: Resolve<T>[] = [];
  private onRejectedCallbacks: Reject[] = [];
  constructor(executor: Executor<T>) {
    // 参数效验
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`);
    }
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  private resolve(value?: T): void {
    if (this.state === State.PENDING) {
      this.state = State.FULFILLED;
      this.value = value;
      this.onResolvedCallbacks.forEach(cb => cb(this.value));
    }
  }
  private reject(reason: any) {
    if (this.state === State.PENDING) {
      this.state = State.REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach(cb => cb(this.reason));
    }
  }
  public then<R1 = T, R2 = never>(
    onfulfilled?:
      | ((value: T) => R1 | PromiseLike<R1> | undefined | null)
      | undefined
      | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | undefined | null
  ): MyPromise<R1 | R2> {
    if (typeof onfulfilled !== 'function') {
      onfulfilled = value => (value as any) as R1;
    }
    if (typeof onrejected !== 'function') {
      onrejected = reason => {
        throw reason;
      };
    }
    const newPromise = new MyPromise<R1 | R2>((resolve, reject) => {
      const realOnfulfilledHandle = (value: T | undefined) => {
        callAsync(() => {
          try {
            const x = onfulfilled!(value!);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };
      const realOnrejectedHandle = (reason: any) => {
        callAsync(() => {
          try {
            const x = onrejected!(reason);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };
      switch (this.state) {
        case State.FULFILLED:
          realOnfulfilledHandle(this.value);
          break;
        case State.REJECTED:
          realOnrejectedHandle(this.reason);
          break;
        case State.PENDING:
          this.onResolvedCallbacks.push(realOnfulfilledHandle);
          this.onRejectedCallbacks.push(realOnrejectedHandle);
          break;
        default:
          assertNever(this.state);
          break;
      }
    });

    return newPromise;
  }
  public catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): MyPromise<TResult | T> {
    return this.then(undefined, onrejected);
  }

  public static resolve<K>(value: K | PromiseLike<K>): MyPromise<K>;
  public static resolve(): MyPromise<void>;
  public static resolve<K>(value?: K | PromiseLike<K>): MyPromise<K | void> {
    return new MyPromise<void>(resolve => {
      resolve();
    }).then(() => {
      return value;
    });
  }
  public static reject<K = never>(reason?: any): MyPromise<K> {
    return new MyPromise<K>((_, reject) => {
      reject(reason);
    });
  }
  public static race<T>(
    values: T[]
  ): MyPromise<T extends PromiseLike<infer U> ? U : T> {
    return new MyPromise((resolve, reject) => {
      let called = false;
      try {
        if (!Array.isArray(values)) {
          reject(new TypeError(`${values} is not iterable `));
          return;
        }
        if (values.length !== 0) {
          for (const item of values) {
            if (called) {
              break;
            }
            if (
              item &&
              ((item as unknown) as PromiseLike<any>).then &&
              typeof ((item as unknown) as PromiseLike<any>).then === 'function'
            ) {
              ((item as unknown) as PromiseLike<any>).then(
                value => {
                  resolve(value);
                  called = true;
                },
                reason => {
                  reject(reason);
                  called = true;
                }
              );
            } else {
              resolve(item as any);
              called = true;
            }
          }
        }
      } catch (error) {
        called = true;
        reject(error);
      }
    });
  }
  public static all<K>(values: (K | PromiseLike<K>)[]): MyPromise<K[]> {
    return new MyPromise((resolve, reject) => {
      let isRejected = false;
      try {
        if (!Array.isArray(values)) {
          reject(new TypeError(`${values} is not iterable `));
          return;
        }
        if (values.length === 0) {
          resolve([]);
        } else {
          const result: K[] = [];
          let count = 0;
          const addToResult = (index: number, value: K) => {
            count++;
            result[index] = value;
            if (count === values.length) {
              resolve(result);
            }
          };
          for (let i = 0; i < values.length; i++) {
            if (isRejected) {
              break;
            }
            const current = values[i];
            if (
              current &&
              (current as any).then &&
              typeof (current as any).then === 'function'
            ) {
              (current as any).then(
                (value: K) => {
                  addToResult(i, value);
                },
                (error: any) => {
                  reject(error);
                  isRejected = true;
                }
              );
            } else {
              addToResult(i, current as K);
            }
          }
        }
      } catch (error) {
        reject(error);
        isRejected = true;
      }
    });
  }
}

const assertNever = (value: never) => {
  value;
};
const callAsync = (cb: () => any) => {
  setTimeout(() => {
    cb();
  });
};
function resolvePromise<T1, T2>(
  newPromise: MyPromise<T1>,
  x: any,
  resolve: Resolve<T2>,
  reject: Reject
): void {
  if (x === newPromise) {
    reject(new TypeError('Chaining cycle detected for promise'));
  }
  let called = false;

  // 判断 x 的类型
  if (x instanceof MyPromise) {
    x.then(
      value => {
        resolvePromise(newPromise, value, resolve, reject);
      },
      reason => {
        reject(reason);
      }
    );
    // 可能是其他实现的 promise
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          (value: any) => {
            if (called) return;
            called = true;
            resolvePromise(newPromise, value, resolve, reject);
          },
          (reason: any) => {
            if (called) return;
            called = true;
            reject(reason);
          }
        );
      } else {
        // 不是 promise 的对象或函数
        if (called) return;
        called = true;
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}
export = MyPromise;
