"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailablePort = void 0;
const child_process_1 = require("child_process");
const net = require('net');
function getAvailablePort(port, isGetNewPort = false) {
    const server = net.createServer().listen(port);
    return new Promise((resolve, reject) => {
        server.on('listening', () => {
            server.close();
            resolve(port);
        });
        server.on('error', async (err) => {
            if (err.code === 'EADDRINUSE') {
                if (isGetNewPort) {
                    resolve(getAvailablePort(port + 1));
                }
                else {
                    await killProcessOnPort(port);
                    resolve(port);
                }
                console.log('this port ' + port + ' is occupied try another.');
            }
            else {
                reject(err);
            }
        });
    });
}
exports.getAvailablePort = getAvailablePort;
function killProcessOnPort(port) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`lsof -t -i tcp:${port}`, (error, stdout, stderr) => {
            if (error) {
                console.error('lsof -t -i tcp:', error);
                reject(error);
                return;
            }
            const pid = stdout.trim();
            if (pid) {
                (0, child_process_1.exec)(`kill -9 ${pid}`, killError => {
                    if (killError) {
                        console.error('Error killing process:', killError);
                        reject(error);
                    }
                    else {
                        console.log(`Killed process ${pid} on port ${port}`);
                        resolve(port);
                    }
                });
            }
            else {
                console.log(`No process found on port ${port}`);
                resolve(port);
            }
        });
    });
}
//# sourceMappingURL=portManager.js.map