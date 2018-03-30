import * as Alexa from 'alexa-sdk'
import { Dict } from '../DictProvider'
import { MerchandiseAggregator } from '../../../procedure/aggregate/MerchandiseAggregator'
import { Merchandise } from '../../../splatoon2ink/model/Gear'
import { nowInSplatFormat } from '../../../util/utils'
import { mapMerchandiseToInfo, MerchInfo } from '../../../procedure/transform/MerchandiseMapper'
import { secondsToTime } from '../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'RequestMerchandise'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    return new MerchandiseAggregator(helper.lang).merchandiseSorted()
        .then(result => respondWithMerch(helper.withContentDict(result.contentDict),result.content))
        .catch(error => {
            console.error(error)
            return helper.speakRplcEmit(helper.dict.global_error_default)
        })
}

function respondWithMerch(helper: HandlerHelper, merchandises: Merchandise[]) {
    if (merchandises.length < 3) {
        return helper.speakRplcEmit(helper.dict.a_merch_002)
    }

    const now = nowInSplatFormat()
    const infos = merchandises.map(merch => {
        return mapMerchandiseToInfo(merch, now, helper.contentDict, secondsToTime)
    })

    helper.speakRplc(helper.dict.a_merch_000_a(
        infos[0].merchName,
        infos[1].merchName,
        infos[2].merchName
    ))

    if (helper.hasDisplay()) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        infos.forEach((info, index) => buildMerchListItem(listItemBuilder, helper.dict, info))

        const template = new Alexa.templateBuilders.ListTemplate2Builder()
            .setToken('merchList')
            .setTitle(helper.dict.a_merch_003)
            .setListItems(listItemBuilder.build())
            .build()
        helper.handler.response.renderTemplate(template)
    }
    
    return helper.emit()
}

function buildMerchListItem(builder: Alexa.templateBuilders.ListItemBuilder, dict: Dict, merchInfo: MerchInfo) {
    return builder.addItem(
        Alexa.utils.ImageUtils.makeImage(merchInfo.merchImage),
        merchInfo.merchName,
        Alexa.utils.TextUtils.makePlainText(merchInfo.merchName),
        Alexa.utils.TextUtils.makePlainText(dict.a_merch_001(
            merchInfo.skillName, 
            merchInfo.brandName,
            merchInfo.timeString)))
}