import { isNullOrUndefined } from 'util';
import { DialogflowApp, Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { getDict, Dict } from '../i18n/resolver'
import { secondsToTime } from '../common/utils'
import { Merchandise } from '../model/api/Gear';

export const name = 'merchandise'

export function handler(app: DialogflowApp) {
    const dict: Dict = getDict(app)

    return new Splatoon2inkApi().getMerchandise()
        .then(merch => merch.merchandises
            .sort((a, b) => {
                if (a.end_time === b.end_time) return 0;
                return a.end_time > b.end_time ? 1 : -1
            }))
        .then(mechandises => respondWithMerch(app, dict, mechandises))
        .catch(error => {
            console.error(error)
            app.tell(dict.global_error_default)
        })
}

// Responder

function respondWithMerch(app: DialogflowApp, dict: Dict, merchandises: Merchandise[]) {
    const now = Math.round(new Date().getTime() / 1000)

    return app.askWithCarousel({
            speech: dict.a_merch_000_s,
            displayText: dict.a_merch_000_t},
        app.buildCarousel()
            .addItems(
                merchandises.map(merch => buildMerchOptionItem(app, dict, merch))))
}

// Item Builder

function buildMerchOptionItem(app: DialogflowApp, dict: Dict, merch: Merchandise): Responeses.buildMerchOptionItem {
    const merchName = dict.api_gear_item(merch.gear.id, merch.gear.name)
    const brandName = dict.api_gear_brand(merch.gear.brand.id, merch.gear.brand.name)
    const skillName = dict.api_gear_skill(merch.skill.id, merch.skill.name)
    return app.buildOptionItem('GEAR_' + merch.gear.id, [merchName])
        .setTitle(merchName)
        .setDescription(dict.a_merch_001(skillName, brandName))
        .setImage(config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + merch.gear.image, merchName)
}