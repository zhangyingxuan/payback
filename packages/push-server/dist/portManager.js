"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailablePort = void 0;
const http_1 = require("http");
function getAvailablePort(port) {
    console.log('error1', port);
    return new Promise((resolve, reject) => {
        const server = (0, http_1.createServer)();
        server
            .listen(port)
            .on('listening', () => resolve(port))
            .on('error', () => {
            console.log('error2', port);
            server.close();
            if (port === port + 10) {
                reject(new Error('No available ports found'));
            }
            resolve(getAvailablePort(port + 1));
        });
    });
}
exports.getAvailablePort = getAvailablePort;
//# sourceMappingURL=portManager.js.map