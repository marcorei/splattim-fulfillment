import { HandlerInput } from 'ask-sdk-core'
import { Response, interfaces } from 'ask-sdk-model'
import { CanHandleHelper, HandlerHelper } from '../util/HandlerHelper'
import { Dict } from '../DictProvider'
import { MerchandiseAggregator } from '../../../procedure/aggregate/MerchandiseAggregator'
import { Merchandise } from '../../../splatoon2ink/model/Gear'
import { nowInSplatFormat } from '../../../util/utils'
import { mapMerchandiseToInfo, MerchInfo } from '../../../procedure/transform/MerchandiseMapper'
import { secondsToTime } from '../util/utils'
import { ListItemBuilder } from '../util/DisplayTemplateUtil'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('RequestMerchandise')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        return new MerchandiseAggregator(helper.lang).merchandiseSorted()
            .then(result => respondWithMerch(helper.withContentDict(result.contentDict),result.content))
            .catch(error => {
                console.error(error)
                return helper.speakRplcEmit(helper.dict.global_error_default)
            })
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
        const listItems = infos.map(info => 
            buildMerchListItem(helper.dict, info))

        helper.addTemplate({
            type: 'ListTemplate2',
            token: 'merchList',
            title: helper.dict.a_merch_003,
            listItems: listItems
        })
    }
    
    return helper.emit()
}

function buildMerchListItem(dict: Dict, merchInfo: MerchInfo) : interfaces.display.ListItem {
    return new ListItemBuilder(merchInfo.merchName)
        .addImage(merchInfo.merchImage)
        .addPlainText(
            merchInfo.merchName,
            dict.a_merch_001(
                merchInfo.skillName, 
                merchInfo.brandName,
                merchInfo.timeString))
        .build()
}