"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const en_1 = require("./en");
function getDict(app) {
    const locale = app.getUserLocale();
    switch (locale) {
        //case 'de-CH':
        //case 'de-AT':
        //case 'de-DE': return de
        default: return en_1.dict;
    }
}
exports.getDict = getDict;
//# sourceMappingURL=resolver.js.map