"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const compression = require("compression");
const app_module_1 = require("./app.module");
const session = require("express-session");
const HttpExceptionFilter_1 = require("./filters/HttpExceptionFilter");
const portManager_1 = require("./portManager");
const express_rate_limit_1 = require("express-rate-limit");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.set('trust proxy', true);
    app.setGlobalPrefix('blowsysun');
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 60 * 1000,
        limit: 10,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
            res.header('Content-Type', 'application/json; charset=utf-8');
            res.status(429).json({
                code: 429,
                data: 'Too many requests, please try again later.',
            });
            console.log(`Request from ${req.ip};-${req.headers['x-real-ip']}-${req.headers['x-forwarded-for']}; exceeded rate limit`);
        },
    });
    app.use('/blowsysun/auth', limiter);
    app.use(compression());
    app.use(session({
        secret: 'blowsysun',
        rolling: true,
        name: 'Mr.zhang',
        saveUninitialized: false,
        cookie: { secure: false },
    }));
    app.useGlobalFilters(new HttpExceptionFilter_1.HttpExceptionFilter());
    const port = await (0, portManager_1.getAvailablePort)(3000);
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map