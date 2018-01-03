import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { sortByEndTime, nowInSplatFormat } from '../common/utils'
import { Merchandise } from '../entity/api/Gear'
import { mapMerchandiseToInfo, MerchInfo } from './mapper/MerchandiseMapper'
import { buildOptionKey } from './MerchandiseMerchOptionAction'

export const name = 'merchandise'

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(app: I18NDialogflowApp) {
    return new Splatoon2inkApi().readMerchandise()
        .then(merch => merch.merchandises
            .sort(sortByEndTime))
        .then(mechandises => respondWithMerch(app, mechandises))
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

function respondWithMerch(app: I18NDialogflowApp, merchandises: Merchandise[]) {
    if (merchandises.length < 3) {
        return app.getDict().a_merch_002
    }
    
    const now = nowInSplatFormat()
    const infos = merchandises.map(merch => {
        return mapMerchandiseToInfo(merch, now, app.getDict())
    })
    
    return app.askWithCarousel({
            speech: app.getDict().a_merch_000_s(
                infos[0].merchName,
                infos[1].merchName,
                infos[2].merchName
            ),
            displayText: app.getDict().a_merch_000_t},
        app.buildCarousel()
            .addItems(
                infos.map(merch => buildMerchOptionItem(app, merch))))
}

function buildMerchOptionItem(app: I18NDialogflowApp, merchInfo: MerchInfo): Responses.OptionItem {
    const optionKey = buildOptionKey(
        merchInfo.merchName, 
        merchInfo.skillName,
        merchInfo.timeDiff)
    return app.buildOptionItem(optionKey, [merchInfo.merchName])
        .setTitle(merchInfo.merchName + ' (' + merchInfo.timeString + ')')
        .setDescription(app.getDict().a_merch_001(
            merchInfo.skillName, 
            merchInfo.brandName,
            merchInfo.timeString))
        .setImage(merchInfo.merchImage, merchInfo.merchName)
}