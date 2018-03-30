import * as Alexa from 'alexa-sdk'
import { Dict } from '../DictProvider'
import { nowInSplatFormat } from '../../../util/utils'
import { Detail } from '../../../splatoon2ink/model/SalmonRunSchedules'
import { mapDetailToInfo, removeDuplicateWeapons, WeaponInfo, DetailInfo } from '../../../procedure/transform/SalmonRunMapper'
import { SalmonRunAggregator } from '../../../procedure/aggregate/SalmunRunAggregator'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'RequestSalmonRun'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    return new SalmonRunAggregator(helper.lang).detailsSorted()
        .then(result => {
            if (result.content.length === 0) {
                return helper.speakRplcEmit(helper.dict.a_sr_000)
            }
            return respondWithDetail(helper.withContentDict(result.contentDict), result.content[0])
        })
        .catch(error => {
            console.error(error)
            return helper.speakRplcEmit(helper.dict.global_error_default)
        })
}

function respondWithDetail(helper: HandlerHelper, detail: Detail) {
    if (detail.weapons.length < 4) {
        console.error('less than four weapons in salmon run info')
        return helper.speakRplcEmit(helper.dict.a_sr_000)
    }

    const info = mapDetailToInfo(detail, nowInSplatFormat(), helper.dict, helper.contentDict, secondsToTime)
    const uniqueWeapons = removeDuplicateWeapons(info.weapons)
    
    if (uniqueWeapons.length > 1) {
        return respondWithMultipleWeapons(helper, info, uniqueWeapons)
    } else {
        return respondWithSingleWeapon(helper, info, uniqueWeapons[0])
    }
}

function respondWithMultipleWeapons(helper: HandlerHelper, info: DetailInfo, uniqueWeapons: WeaponInfo[]) {
    helper.speakRplc(info.open ?
        helper.dict.a_sr_002_a(
            info.stageName, 
            wrapTimeString(info.timeString),
            info.weapons[0].name,
            info.weapons[1].name,
            info.weapons[2].name,
            info.weapons[3].name) :
        helper.dict.a_sr_003_a(
            info.stageName, 
            wrapTimeString(info.timeString),
            info.weapons[0].name,
            info.weapons[1].name,
            info.weapons[2].name,
            info.weapons[3].name))

    if (helper.hasDisplay()) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        uniqueWeapons.forEach((info, index) => buildWeaponListItem(listItemBuilder, helper.dict, info))

        const template = new Alexa.templateBuilders.ListTemplate1Builder()
            .setToken('weaponList')
            .setTitle(helper.dict.a_sr_007)
            .setListItems(listItemBuilder.build())
            .build()
        helper.handler.response.renderTemplate(template)
    }

    return helper.emit()
}

function respondWithSingleWeapon(helper: HandlerHelper, info: DetailInfo, weaponInfo: WeaponInfo) {
    helper.speakRplc(info.open ?
        helper.dict.a_sr_005_s(
            info.stageName, 
            wrapTimeString(info.timeString),
            weaponInfo.name) :
        helper.dict.a_sr_006_s(
            info.stageName, 
            wrapTimeString(info.timeString),
            weaponInfo.name))

    if (helper.hasDisplay()) {
        helper.handler.response.cardRenderer(
            weaponInfo.name, 
            info.timeString, 
            {
                smallImageUrl: weaponInfo.image,
                largeImageUrl: weaponInfo.image
            })
    }
        
    return helper.emit()
}

function buildWeaponListItem(builder: Alexa.templateBuilders.ListItemBuilder, dict: Dict, weaponInfo: WeaponInfo) {
    return builder.addItem(
        Alexa.utils.ImageUtils.makeImage(weaponInfo.image),
        weaponInfo.name,
        Alexa.utils.TextUtils.makePlainText(weaponInfo.name))
}