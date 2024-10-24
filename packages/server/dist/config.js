"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.microserviceConfig = void 0;
exports.microserviceConfig = {
    env: {
        pushServerUrl: 'http://localhost:3000/push',
        newsServerUrl: 'http://localhost:4000/pay',
    },
    prod: {
        pushServerUrl: 'http://localhost:3000/push',
        newsServerUrl: 'http://localhost:4000/pay',
    },
};
exports.config = exports.microserviceConfig[process.env.NODE_ENV];
//# sourceMappingURL=config.js.map