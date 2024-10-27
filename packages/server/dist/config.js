"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.microserviceConfig = exports.microserviceConfigs = void 0;
exports.microserviceConfigs = {
    dev: {
        pushServer: {
            host: '43.154.139.108',
            port: 3001,
        },
    },
    prod: {
        pushServer: {
            host: '43.154.139.108',
            port: 3001,
        },
    },
};
exports.microserviceConfig = exports.microserviceConfigs[process.env.NODE_ENV];
//# sourceMappingURL=config.js.map