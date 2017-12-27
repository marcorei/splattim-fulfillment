"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const util_1 = require("util");
function loadContent(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            if (util_1.isNullOrUndefined(response.statusCode) || response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to content, status code: ' + response.statusCode));
            }
            const body = [];
            response.on('data', chunk => body.push(chunk));
            response.on('end', () => resolve(body.join('')));
        });
        request.on('error', (error) => reject(error));
    });
}
exports.loadContent = loadContent;
//# sourceMappingURL=httpsPromise.js.map