"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpsPromise = require("../common/httpsPromise");
const jsonPromise = require("../common/jsonPromise");
const config_1 = require("../config");
class Splatoon2inkApi {
    getSchedules() {
        return httpsPromise.loadContent(config_1.config.splatoonInk.baseUrl + config_1.config.splatoonInk.data.schedules)
            .then(json => jsonPromise.parse(json));
    }
    getSalmonRunSchedules() {
        return httpsPromise.loadContent(config_1.config.splatoonInk.baseUrl + config_1.config.splatoonInk.data.coopSchedules)
            .then(json => jsonPromise.parse(json));
    }
    getMerchandise() {
        return httpsPromise.loadContent(config_1.config.splatoonInk.baseUrl + config_1.config.splatoonInk.data.merchandise)
            .then(json => jsonPromise.parse(json));
    }
}
exports.Splatoon2inkApi = Splatoon2inkApi;
//# sourceMappingURL=Splatoon2inkApi.js.map