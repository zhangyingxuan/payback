export class FetchRequestIterator {
  middlewares: Array<Function>;

  constructor() {
    this.middlewares = [];
  }

  add(fn) {
    this.middlewares.push(fn); //存入任务
    return this;
  }
  async run(ctx) {
    function createNext(middleware, oldNext) {
      return async () => {
        await middleware(ctx, oldNext);
      }
    }
    let len = this.middlewares.length;
    let next = async () => {
      return Promise.resolve();
    };
    for (let i = len - 1; i >= 0; i--) {
      let currentMiddleware = this.middlewares[i];
      next = createNext(currentMiddleware, next);
    }
    await next();
  }
}

// 顺序执行函数
// 使用方法
// 1、创建一个数组，存放任务
// const funcs = [];
// 2、将异步任务存入数组中
// funcs.push(task1/2/3);
// 3、执行函数
// this.nextRegister(funcs);
export function nextRegister(args: Array<Function>) {
  var count = 0;
  var comm = {};
  function nextTime() {
    count++;
    if (count < args.length) {
      if (args[count] && Object.prototype.toString.call(args[count]) == '[object AsyncFunction]') {
        args[count](comm, nextTime);
      }
    }
  }
  if (args[count] && Object.prototype.toString.call(args[count]) == '[object AsyncFunction]') {
    args[count](comm, nextTime);
  }
}