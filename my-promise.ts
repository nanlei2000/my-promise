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
export class MyPromise<T> {
  private state: State = State.PENDING;
  private value: T | undefined = undefined;
  private reason: any = undefined;
  private onResolvedCallbacks: Resolve<T>[] = [];
  private onRejectedCallbacks: Reject[] = [];
  constructor(executor: Executor<T>) {
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  private resolve(value?: T): void {
    console.log(this);
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

  public then<R1, R2 = undefined>(
    onfulfilled?: (value: T) => R1 | MyPromise<R1>,
    onrejected?: (reason: any) => R2 | MyPromise<R2>
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

  public catch<R2>(onrejected?: (reason: any) => R2): MyPromise<R2> {
    return this.then(() => {}, onrejected) as MyPromise<R2>;
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
            resolvePromise(newPromise, value, resolve, reject);
          },
          (reason: any) => {
            reject(reason);
          }
        );
      } else {
        // 不是 promise 的对象或函数
        if (called) {
          return;
        }
        called = true;
        resolve(x);
      }
    } catch (error) {
      if (called) {
        return;
      }
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}

const a = new MyPromise(resolve => {
  setTimeout(() => {
    resolve();
  }, 1000);
});
a.then(() => {
  console.log(1);
});
a.then(() => {
  console.log(2);
});
