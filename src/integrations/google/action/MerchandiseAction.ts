import { Carousel, GoogleActionsV2UiElementsCarouselSelectCarouselItem, SimpleResponse } from 'actions-on-google'
import { CustomConversation } from '../util/CustomConversation'
import { nowInSplatFormat } from '../../../util/utils'
import { Merchandise } from '../../../splatoon2ink/model/Gear'
import { mapMerchandiseToInfo, MerchInfo } from '../../../procedure/transform/MerchandiseMapper'
import { buildOptionKey } from './MerchandiseMerchOptionAction'
import { ContentDict } from '../../../i18n/ContentDict'
import { MerchandiseAggregator } from '../../../procedure/aggregate/MerchandiseAggregator'
import { secondsToTime } from '../util/utils'

export const names = ['Request - Merchandise']

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(conv: CustomConversation) {
    return new MerchandiseAggregator(conv.lang).merchandiseSorted()
        .then(result => respondWithMerch(conv, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

function respondWithMerch(conv: CustomConversation, contentDict: ContentDict, merchandises: Merchandise[]) {
    if (merchandises.length < 3) {
        return conv.close(conv.dict.a_merch_002)
    }
    
    const now = nowInSplatFormat()
    const infos = merchandises.map(merch => mapMerchandiseToInfo(merch, now, contentDict, secondsToTime))
    
    if (!conv.hasDisplay) {
        return conv.close(conv.dict.a_merch_000_a(
            infos[0].merchName,
            infos[1].merchName,
            infos[2].merchName
        ))
    }

    conv.ask(new SimpleResponse({
        text: conv.dict.a_merch_000_t,
        speech: conv.dict.a_merch_000_s(
            infos[0].merchName,
            infos[1].merchName,
            infos[2].merchName
        )
    }))

    return conv.ask(new Carousel({
        items: infos.map(info => buildMerchOptionItem(conv, info))
    }))
}

function buildMerchOptionItem(conv: CustomConversation, merchInfo: MerchInfo) : GoogleActionsV2UiElementsCarouselSelectCarouselItem {
    return {
        optionInfo: {
            key: buildOptionKey(
                merchInfo.merchName, 
                merchInfo.skillName,
                merchInfo.timeDiff),
            synonyms: [merchInfo.merchName]
        },
        title: `${merchInfo.merchName} (${merchInfo.timeString})`,
        description: conv.dict.a_merch_001(
            merchInfo.skillName, 
            merchInfo.brandName,
            merchInfo.timeString),
        image: {
            url: merchInfo.merchImage,
            accessibilityText: merchInfo.merchName
        }
    }
}