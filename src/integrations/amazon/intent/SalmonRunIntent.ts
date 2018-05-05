import { HandlerInput } from 'ask-sdk-core'
import { Response, interfaces } from 'ask-sdk-model'
import { Dict } from '../DictProvider'
import { nowInSplatFormat } from '../../../util/utils'
import { Detail } from '../../../splatoon2ink/model/SalmonRunSchedules'
import { mapDetailToInfo, removeDuplicateWeapons, WeaponInfo, DetailInfo } from '../../../procedure/transform/SalmonRunMapper'
import { SalmonRunAggregator } from '../../../procedure/aggregate/SalmunRunAggregator'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper, CanHandleHelper } from '../util/HandlerHelper'
import { ListItemBuilder } from '../util/DisplayTemplateUtil'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('RequestSalmonRun')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
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
        const listItems = uniqueWeapons.map(info => 
            buildWeaponListItem(helper.dict, info))

        helper.addTemplate({
            type: 'ListTemplate1',
            token: 'weaponList',
            title: helper.dict.a_sr_007,
            listItems: listItems
        })
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
        helper.addCard({
            title: weaponInfo.name,
            content: info.timeString,
            image: weaponInfo.image
        })
    }
        
    return helper.emit()
}

function buildWeaponListItem(dict: Dict, weaponInfo: WeaponInfo) : interfaces.display.ListItem {
    return new ListItemBuilder(weaponInfo.name)
        .addImage(weaponInfo.image)
        .addPlainText(weaponInfo.name)
        .build()
}