import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { Responses } from 'actions-on-google'
import { nowInSplatFormat } from '../../../util/utils'
import { Merchandise } from '../../../splatoon2ink/model/Gear'
import { mapMerchandiseToInfo, MerchInfo } from '../../../procedure/transform/MerchandiseMapper'
import { buildOptionKey } from './MerchandiseMerchOptionAction'
import { ContentDict } from '../../../i18n/ContentDict'
import { MerchandiseAggregator } from '../../../procedure/aggregate/MerchandiseAggregator'
import { secondsToTime } from '../util/utils'

export const name = 'merchandise'

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(app: I18NDialogflowApp) {
    return new MerchandiseAggregator(app.getLang()).merchandiseSorted()
        .then(result => respondWithMerch(app, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

function respondWithMerch(app: I18NDialogflowApp, contentDict: ContentDict, merchandises: Merchandise[]) {
    if (merchandises.length < 3) {
        return app.tell(app.getDict().a_merch_002)
    }
    
    const now = nowInSplatFormat()
    const infos = merchandises.map(merch => {
        return mapMerchandiseToInfo(merch, now, contentDict, secondsToTime)
    })

    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(app.getDict().a_merch_000_a(
            infos[0].merchName,
            infos[1].merchName,
            infos[2].merchName
        ))
    }
    
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