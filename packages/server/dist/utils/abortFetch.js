"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFetch = void 0;
const node_fetch_1 = require("node-fetch");
function createFetch(timeout = 60000) {
    return (resource, options = {}) => {
        const controller = new AbortController();
        options = options || {};
        options.signal = controller.signal;
        const timeoutId = setTimeout(() => {
            console.log(`${resource} 请求超时 ${timeout}ms`);
            controller.abort();
        }, timeout);
        return (0, node_fetch_1.default)(resource, options)
            .then(response => {
            clearTimeout(timeoutId);
            return response;
        })
            .catch(error => {
            clearTimeout(timeoutId);
            throw error;
        });
    };
}
exports.createFetch = createFetch;
//# sourceMappingURL=abortFetch.js.map