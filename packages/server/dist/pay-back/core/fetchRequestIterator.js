"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextRegister = exports.FetchRequestIterator = void 0;
class FetchRequestIterator {
    constructor() {
        this.middlewares = [];
    }
    add(fn) {
        this.middlewares.push(fn);
        return this;
    }
    async run(ctx) {
        function createNext(middleware, oldNext) {
            return async () => {
                await middleware(ctx, oldNext);
            };
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
exports.FetchRequestIterator = FetchRequestIterator;
function nextRegister(args) {
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
exports.nextRegister = nextRegister;
//# sourceMappingURL=fetchRequestIterator.js.map