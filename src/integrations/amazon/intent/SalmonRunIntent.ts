import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { ContentDict } from '../../../i18n/ContentDict'
import { nowInSplatFormat } from '../../../util/utils'
import { Detail } from '../../../splatoon2ink/model/SalmonRunSchedules'
import { mapDetailToInfo, removeDuplicateWeapons, WeaponInfo, DetailInfo } from '../../../procedure/transform/SalmonRunMapper'
import { SalmonRunAggregator } from '../../../procedure/aggregate/SalmunRunAggregator'

export const name = 'RequestSalmonRun'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    return new SalmonRunAggregator(dictProvider.getLang()).detailsSorted()
        .then(result => {
            if (result.content.length === 0) {
                this.response.speak(dict.a_sr_000)
                return this.emit(':responseReady')
            }
            return respondWithDetail(this, dict, result.contentDict, result.content[0])
        })
        .catch(error => {
            this.response.speak(dict.global_error_default)
            return this.emit(':responseReady')
        })
}

function respondWithDetail(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, detail: Detail) {
    if (detail.weapons.length < 4) {
        console.error('less than four weapons in salmon run info')
        handler.response.speak(dict.a_sr_000)
        return handler.emit(':responseReady')
    }

    const info = mapDetailToInfo(detail, nowInSplatFormat(), dict, contentDict)
    const uniqueWeapons = removeDuplicateWeapons(info.weapons)
    
    if (uniqueWeapons.length > 1) {
        return respondWithMultipleWeapons(handler, dict, info, uniqueWeapons)
    } else {
        return respondWithSingleWeapon(handler, dict, info, uniqueWeapons[0])
    }
}

function respondWithMultipleWeapons(handler: Alexa.Handler<Alexa.Request>, dict: Dict, info: DetailInfo, uniqueWeapons: WeaponInfo[]) {
    handler.response.speak(info.open ?
        dict.a_sr_002_a(
            info.stageName, 
            info.timeString,
            info.weapons[0].name,
            info.weapons[1].name,
            info.weapons[2].name,
            info.weapons[3].name) :
        dict.a_sr_003_a(
            info.stageName, 
            info.timeString,
            info.weapons[0].name,
            info.weapons[1].name,
            info.weapons[2].name,
            info.weapons[3].name))

    if (handler.event.context.System.device.supportedInterfaces.Display) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        uniqueWeapons.forEach((info, index) => buildWeaponListItem(listItemBuilder, dict, info))

        const template = new Alexa.templateBuilders.ListTemplate1Builder()
            .setToken('weaponList')
            .setTitle(dict.a_sr_007)
            .setListItems(listItemBuilder.build())
            .build()
        handler.response.renderTemplate(template)
    }

    return handler.emit(':responseReady')
}

function respondWithSingleWeapon(handler: Alexa.Handler<Alexa.Request>, dict: Dict, info: DetailInfo, weaponInfo: WeaponInfo) {
    handler.response.speak(info.open ?
        dict.a_sr_005_s(
            info.stageName, 
            info.timeString,
            weaponInfo.name) :
        dict.a_sr_006_s(
            info.stageName, 
            info.timeString,
            weaponInfo.name))

    handler.response.cardRenderer(
        weaponInfo.name, 
        info.timeString, 
        {
            smallImageUrl: weaponInfo.image,
            largeImageUrl: weaponInfo.image
        })
        
    return handler.emit(':responseReady')
}

function buildWeaponListItem(builder: Alexa.templateBuilders.ListItemBuilder, dict: Dict, weaponInfo: WeaponInfo) {
    return builder.addItem(
        Alexa.utils.ImageUtils.makeImage(weaponInfo.image),
        weaponInfo.name,
        Alexa.utils.TextUtils.makePlainText(weaponInfo.name))
}