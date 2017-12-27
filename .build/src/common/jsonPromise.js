"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parse(json) {
    return new Promise((resolve, reject) => {
        try {
            const obj = JSON.parse(json);
            resolve(obj);
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.parse = parse;
//# sourceMappingURL=jsonPromise.js.map