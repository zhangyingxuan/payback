"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestMiddleware = void 0;
class HttpRequestMiddleware {
    use(req, res, next) {
        next();
        console.log(JSON.stringify(req.headers));
    }
}
exports.HttpRequestMiddleware = HttpRequestMiddleware;
//# sourceMappingURL=HttpRequestMiddleware.js.map