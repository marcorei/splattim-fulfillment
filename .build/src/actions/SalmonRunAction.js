"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Splatoon2inkApi_1 = require("../data/Splatoon2inkApi");
const config_1 = require("../config");
const resolver_1 = require("../i18n/resolver");
const utils_1 = require("../common/utils");
exports.name = 'next_grizzco';
function handler(app) {
    const dict = resolver_1.getDict(app);
    return new Splatoon2inkApi_1.Splatoon2inkApi().getSalmonRunSchedules()
        .then(schedules => schedules.details
        .sort((a, b) => {
        if (a.start_time === b.start_time)
            return 0;
        return a.start_time > b.start_time ? 1 : -1;
    }))
        .then(details => {
        if (details.length === 0) {
            app.tell(dict.a_sr_000);
            return;
        }
        respondWithDetail(app, dict, details[0]);
    })
        .catch(error => {
        console.error(error);
        app.tell(dict.global_error_default);
    });
}
exports.handler = handler;
// Responder
function respondWithDetail(app, dict, detail) {
    const now = Math.round(new Date().getTime() / 1000);
    const stageString = dict.api_grizz_stage(detail.stage.name, detail.stage.name); // No key from API
    const eta = utils_1.secondsToTime(detail.start_time - now);
    return app.askWithCarousel({
        speech: now >= detail.start_time ?
            dict.a_sr_002_s(stageString) :
            dict.a_sr_003_s(stageString, eta),
        displayText: now >= detail.start_time ?
            dict.a_sr_002_t(stageString) :
            dict.a_sr_003_t(stageString, eta)
    }, app.buildCarousel()
        .addItems(detail.weapons.map(weapon => buildWeaponOptionItem(app, dict, weapon))));
}
// Item Builder
function buildWeaponOptionItem(app, dict, weapon) {
    const weaponName = dict.api_grizz_weapon(weapon.id, weapon.name);
    return app.buildOptionItem('WEAPON_' + weapon.id, [weaponName])
        .setTitle(weaponName)
        .setImage(config_1.config.splatoonInk.baseUrl + config_1.config.splatoonInk.assets.splatnet + weapon.image, weaponName);
}
//# sourceMappingURL=SalmonRunAction.js.map