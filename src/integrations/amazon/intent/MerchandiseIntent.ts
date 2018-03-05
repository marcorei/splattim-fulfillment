import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { MerchandiseAggregator } from '../../../procedure/aggregate/MerchandiseAggregator'
import { ContentDict } from '../../../i18n/ContentDict'
import { Merchandise } from '../../../splatoon2ink/model/Gear'
import { nowInSplatFormat } from '../../../util/utils'
import { mapMerchandiseToInfo, MerchInfo } from '../../../procedure/transform/MerchandiseMapper'

export const name = 'RequestMerchandise'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    return new MerchandiseAggregator(dictProvider.getLang()).merchandiseSorted()
        .then(result => respondWithMerch(this, dict, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            this.response.speak(dict.global_error_default)
            return this.emit(':responseReady')
        })
}

function respondWithMerch(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, merchandises: Merchandise[]) {
    if (merchandises.length < 3) {
        handler.response.speak(dict.a_merch_002)
        return handler.emit(':responseReady')
    }

    const now = nowInSplatFormat()
    const infos = merchandises.map(merch => {
        return mapMerchandiseToInfo(merch, now, contentDict)
    })

    handler.response.speak(dict.a_merch_000_a(
        infos[0].merchName,
        infos[1].merchName,
        infos[2].merchName
    ))

    if (handler.event.context.System.device.supportedInterfaces.Display) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        infos.forEach((info, index) => buildMerchListItem(listItemBuilder, dict, info))

        const template = new Alexa.templateBuilders.ListTemplate2Builder()
            .setToken('merchList')
            .setTitle(dict.a_merch_003)
            .setListItems(listItemBuilder.build())
            .build()
        handler.response.renderTemplate(template)
    }
    
    return handler.emit(':responseReady')
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