import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
import { Responses } from 'actions-on-google'
import { Detail } from '../entity/api/SalmonRunSchedules'
import { sortByStartTime, nowInSplatFormat } from '../common/utils'
import { mapDetailToInfo, WeaponInfo, DetailInfo } from './mapper/SalmonRunMapper'
import { buildOptionKey } from './SalmonRunWeaponOptionAction'
import { ContentDict } from '../i18n/ContentDict'
import { I18NSplatoon2API } from '../i18n/I18NSplatoon2Api'
import { isNullOrUndefined } from 'util';

export const name = 'next_grizzco'

/**
 * Info about current or upcoming Salmon Run.
 * Also shows weapons in a carousel.
 */
export function handler(app: I18NDialogflowApp) {
    return new I18NSplatoon2API(app).readSalmonRunSchedules()
        .then(result => {
            Promise.resolve(result.content)
                .then(schedules => schedules.details
                    .sort(sortByStartTime))
                .then(details => {
                    if (details.length === 0) {
                        return app.tell(app.getDict().a_sr_000)
                    }
                    return respondWithDetail(app, result.contentDict, details[0])
                })
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

/**
 * Responds with a list of weapons available and a text about the next or current schedule.
 */
function respondWithDetail(app: I18NDialogflowApp, contentDict: ContentDict, detail: Detail) {
    if (detail.weapons.length < 4) {
        console.error('less than four weapons in salmon run info')
        return app.tell(app.getDict().a_sr_000)
    }
    const info = mapDetailToInfo(detail, nowInSplatFormat(), app.getDict(), contentDict)
    const uniqueWeapons = removeDuplicateWeapons(info.weapons)
    
    if (uniqueWeapons.length > 1) {
        return respondWithMultipleWeapons(app, info, uniqueWeapons)
    } else {
        return respondWithSingleWeapon(app, info, uniqueWeapons[0])
    }
}

function respondWithMultipleWeapons(app: I18NDialogflowApp, info: DetailInfo, uniqueWeapons: WeaponInfo[]) {
    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(info.open ?
            app.getDict().a_sr_002_a(
                info.stageName, 
                info.timeString,
                info.weapons[0].name,
                info.weapons[1].name,
                info.weapons[2].name,
                info.weapons[3].name) :
            app.getDict().a_sr_003_a(
                info.stageName, 
                info.timeString,
                info.weapons[0].name,
                info.weapons[1].name,
                info.weapons[2].name,
                info.weapons[3].name))
    }

    return app.askWithCarousel({
            speech: info.open ?
                app.getDict().a_sr_002_s(
                    info.stageName, 
                    info.timeString,
                    info.weapons[0].name,
                    info.weapons[1].name,
                    info.weapons[2].name,
                    info.weapons[3].name) :
                app.getDict().a_sr_003_s(
                    info.stageName, 
                    info.timeString,
                    info.weapons[0].name,
                    info.weapons[1].name,
                    info.weapons[2].name,
                    info.weapons[3].name),
            displayText: info.open ?
                app.getDict().a_sr_002_t(info.stageName, info.timeString) :
                app.getDict().a_sr_003_t(info.stageName, info.timeString)},
        app.buildCarousel()
            .addItems(
                uniqueWeapons.map(weapon => 
                    buildWeaponOptionItem(app, weapon))))
}

function respondWithSingleWeapon(app: I18NDialogflowApp, info: DetailInfo, weaponInfo: WeaponInfo) {
    const speech = info.open ?
        app.getDict().a_sr_005_s(
            info.stageName, 
            info.timeString,
            weaponInfo.name) :
        app.getDict().a_sr_006_s(
            info.stageName, 
            info.timeString,
            weaponInfo.name)
    
    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(speech)
    }

    const text = info.open ?
        app.getDict().a_sr_005_t(info.stageName, info.timeString) :
        app.getDict().a_sr_006_t(info.stageName, info.timeString)
    const card = app.buildBasicCard()
        .setTitle(weaponInfo.name)
        .setImage(weaponInfo.image, weaponInfo.name)
    return app.tell(app.buildRichResponse()
        .addSimpleResponse({
            speech: speech,
            displayText: text
        })
        .addBasicCard(card))
}

function buildWeaponOptionItem(app: I18NDialogflowApp, weaponInfo: WeaponInfo): Responses.OptionItem {
    const optionKey = buildOptionKey(weaponInfo.name)
    return app.buildOptionItem(optionKey, [weaponInfo.name])
        .setTitle(weaponInfo.name)
        .setImage(weaponInfo.image, weaponInfo.name)
}

function removeDuplicateWeapons(weapons: WeaponInfo[]): WeaponInfo[] {
    const uniqueWeaponsLookup: {[id: string] : boolean} = {}
    return weapons.filter(weapon => {
        if (isNullOrUndefined(uniqueWeaponsLookup[weapon.name])) {
            uniqueWeaponsLookup[weapon.name] = true
            return true
        }
        return false
    })
}