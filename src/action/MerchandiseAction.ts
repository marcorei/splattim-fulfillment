import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp';
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { secondsToTime } from '../common/utils'
import { Merchandise } from '../entity/api/Gear';

export const name = 'merchandise'

export function handler(app: I18NDialogflowApp) {
    return new Splatoon2inkApi().getMerchandise()
        .then(merch => merch.merchandises
            .sort((a, b) => {
                if (a.end_time === b.end_time) return 0;
                return a.end_time > b.end_time ? 1 : -1
            }))
        .then(mechandises => respondWithMerch(app, mechandises))
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

// Responder

function respondWithMerch(app: I18NDialogflowApp, merchandises: Merchandise[]) {
    const now = Math.round(new Date().getTime() / 1000)

    return app.askWithCarousel({
            speech: app.getDict().a_merch_000_s,
            displayText: app.getDict().a_merch_000_t},
        app.buildCarousel()
            .addItems(
                merchandises.map(merch => buildMerchOptionItem(app, merch, now))))
}

// Item Builder

function buildMerchOptionItem(app: I18NDialogflowApp, merch: Merchandise, now: number): Responses.OptionItem {
    const merchName = app.getDict().api_gear_item(merch.gear)
    const brandName = app.getDict().api_gear_brand(merch.gear.brand)
    const skillName = app.getDict().api_gear_skill(merch.skill)
    const eta = secondsToTime(merch.end_time - now)
    return app.buildOptionItem('GEAR_' + merch.gear.id + '_' + eta, [merchName])
        .setTitle(merchName + ' (' + eta + ')')
        .setDescription(app.getDict().a_merch_001(skillName, brandName, eta))
        .setImage(config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + merch.gear.image, merchName)
}