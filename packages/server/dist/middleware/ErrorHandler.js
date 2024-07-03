"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
function errorHandler(err, req, res, next) {
    console.log(err);
    if (err.name === 'RateLimitError') {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.',
            error: 'Rate limit exceeded',
        });
    }
    else {
        next(err);
    }
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=ErrorHandler.js.map