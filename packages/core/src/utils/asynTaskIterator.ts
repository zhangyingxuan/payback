/**
 * 顺序执行异步任务队列（适用于批量生成的异步任务，比如：批量执行接口调用，避免高并发）
 * 1、创建AsynTaskIterator类
 * let app = new AsynTaskIterator();
 * 2、加入待执行异步任务
 * app.add(task1/2/3）
 * 注意：异步任务中需手动加入 next();方法以提示任务队列接着往下走
 * 3、执行任务队列，传入当前执行上下文
 * app.run(this);
 */
export class AsynTaskIterator {
  middlewares: Array<Function>;

  constructor() {
    this.middlewares = [];
  }

  add(fn: Function) {
    this.middlewares.push(fn); //存入任务
    return this;
  }
  async run(ctx: any) {
    function createNext(middleware: Function, oldNext: Function) {
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
// 2、将异步任务（promise）存入数组中
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