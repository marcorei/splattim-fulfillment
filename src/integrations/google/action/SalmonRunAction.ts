import { CustomConversation } from '../util/CustomConversation'
import { RichResponse, SimpleResponse, Carousel, GoogleActionsV2UiElementsCarouselSelectCarouselItem, BasicCard } from 'actions-on-google'
import { Detail } from '../../../splatoon2ink/model/SalmonRunSchedules'
import { nowInSplatFormat } from '../../../util/utils'
import { mapDetailToInfo, removeDuplicateWeapons, WeaponInfo, DetailInfo } from '../../../procedure/transform/SalmonRunMapper'
import { buildOptionKey } from './SalmonRunWeaponOptionAction'
import { ContentDict } from '../../../i18n/ContentDict'
import { SalmonRunAggregator } from '../../../procedure/aggregate/SalmunRunAggregator'
import { secondsToTime } from '../util/utils'

export const name = 'next_grizzco'

/**
 * Info about current or upcoming Salmon Run.
 * Also shows weapons in a carousel.
 */
export function handler(conv: CustomConversation) {
    return new SalmonRunAggregator(conv.lang).detailsSorted()
        .then(result => {
            if (result.content.length === 0) {
                return conv.close(conv.dict.a_sr_000)
            }
            return respondWithDetail(conv, result.contentDict, result.content[0])
        })
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

/**
 * Responds with a list of weapons available and a text about the next or current schedule.
 */
function respondWithDetail(conv: CustomConversation, contentDict: ContentDict, detail: Detail) {
    if (detail.weapons.length < 4) {
        console.error('less than four weapons in salmon run info')
        return conv.close(conv.dict.a_sr_000)
    }
    const info = mapDetailToInfo(detail, nowInSplatFormat(), conv.dict, contentDict, secondsToTime)
    const uniqueWeapons = removeDuplicateWeapons(info.weapons)
    
    if (uniqueWeapons.length > 1) {
        return respondWithMultipleWeapons(conv, info, uniqueWeapons)
    } else {
        return respondWithSingleWeapon(conv, info, uniqueWeapons[0])
    }
}

function respondWithMultipleWeapons(conv: CustomConversation, info: DetailInfo, uniqueWeapons: WeaponInfo[]) {
    if (!conv.hasDisplay()) {
        return conv.close(info.open ?
            conv.dict.a_sr_002_a(
                info.stageName, 
                info.timeString,
                info.weapons[0].name,
                info.weapons[1].name,
                info.weapons[2].name,
                info.weapons[3].name) :
            conv.dict.a_sr_003_a(
                info.stageName, 
                info.timeString,
                info.weapons[0].name,
                info.weapons[1].name,
                info.weapons[2].name,
                info.weapons[3].name))
    }

    conv.ask(new SimpleResponse({
        speech: info.open ?
            conv.dict.a_sr_002_s(
                info.stageName, 
                info.timeString,
                info.weapons[0].name,
                info.weapons[1].name,
                info.weapons[2].name,
                info.weapons[3].name) :
            conv.dict.a_sr_003_s(
                info.stageName, 
                info.timeString,
                info.weapons[0].name,
                info.weapons[1].name,
                info.weapons[2].name,
                info.weapons[3].name),
        text: info.open ?
            conv.dict.a_sr_002_t(info.stageName, info.timeString) :
            conv.dict.a_sr_003_t(info.stageName, info.timeString)
    }))

    return conv.ask(new Carousel({
        items: uniqueWeapons.map(weapon => buildWeaponOptionItem(conv, weapon))
    }))
}

function respondWithSingleWeapon(conv: CustomConversation, info: DetailInfo, weaponInfo: WeaponInfo) {
    const speech = info.open ?
        conv.dict.a_sr_005_s(
            info.stageName, 
            info.timeString,
            weaponInfo.name) :
        conv.dict.a_sr_006_s(
            info.stageName, 
            info.timeString,
            weaponInfo.name)
    
    if (!conv.hasDisplay()) {
        return conv.close(speech)
    }

    const text = info.open ?
        conv.dict.a_sr_005_t(info.stageName, info.timeString) :
        conv.dict.a_sr_006_t(info.stageName, info.timeString)

    return conv.close(new RichResponse()
        .add(new SimpleResponse({
            speech: speech,
            text: text
        }))
        .add(new BasicCard({
            title: weaponInfo.name,
            image: {
                url: weaponInfo.image,
                accessibilityText: weaponInfo.name
            }
        })))
}

function buildWeaponOptionItem(conv: CustomConversation, weaponInfo: WeaponInfo) : GoogleActionsV2UiElementsCarouselSelectCarouselItem {
    return {
        optionInfo: {
            key: buildOptionKey(weaponInfo.name),
            synonyms: [weaponInfo.name]
        },
        title: weaponInfo.name,
        image: {
            url: weaponInfo.image,
            accessibilityText: weaponInfo.name
        }
    }
}