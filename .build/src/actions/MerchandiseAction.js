"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Splatoon2inkApi_1 = require("../data/Splatoon2inkApi");
const config_1 = require("../config");
const resolver_1 = require("../i18n/resolver");
const utils_1 = require("../common/utils");
exports.name = 'merchandise';
function handler(app) {
    const dict = resolver_1.getDict(app);
    return new Splatoon2inkApi_1.Splatoon2inkApi().getMerchandise()
        .then(merch => merch.merchandises
        .sort((a, b) => {
        if (a.end_time === b.end_time)
            return 0;
        return a.end_time > b.end_time ? 1 : -1;
    }))
        .then(mechandises => respondWithMerch(app, dict, mechandises))
        .catch(error => {
        console.error(error);
        app.tell(dict.global_error_default);
    });
}
exports.handler = handler;
// Responder
function respondWithMerch(app, dict, merchandises) {
    const now = Math.round(new Date().getTime() / 1000);
    return app.askWithCarousel({
        speech: dict.a_merch_000_s,
        displayText: dict.a_merch_000_t
    }, app.buildCarousel()
        .addItems(merchandises.map(merch => buildMerchOptionItem(app, dict, merch, now))));
}
// Item Builder
function buildMerchOptionItem(app, dict, merch, now) {
    const merchName = dict.api_gear_item(merch.gear.id, merch.gear.name);
    const brandName = dict.api_gear_brand(merch.gear.brand.id, merch.gear.brand.name);
    const skillName = dict.api_gear_skill(merch.skill.id, merch.skill.name);
    const eta = utils_1.secondsToTime(merch.end_time - now);
    return app.buildOptionItem('GEAR_' + merch.gear.id, [merchName])
        .setTitle(merchName)
        .setDescription(dict.a_merch_001(skillName, brandName, eta))
        .setImage(config_1.config.splatoonInk.baseUrl + config_1.config.splatoonInk.assets.splatnet + merch.gear.image, merchName);
}
//# sourceMappingURL=MerchandiseAction.js.map