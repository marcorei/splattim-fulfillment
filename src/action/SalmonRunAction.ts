import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp';
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { Detail } from '../entity/api/SalmonRunSchedules'
import { sortByStartTime, nowInSplatFormat } from '../common/utils'
import { mapDetailToInfo, WeaponInfo } from './mapper/SalmonRunMapper'
import { buildOptionKey } from './SalmonRunWeaponOptionAction'

export const name = 'next_grizzco'

/**
 * Info about current or upcoming Salmon Run.
 * Also shows weapons in a carousel.
 */
export function handler(app: I18NDialogflowApp) {
    return new Splatoon2inkApi().readSalmonRunSchedules()
        .then(schedules => schedules.details
            .sort(sortByStartTime))
        .then(details => {
            if (details.length === 0) {
                return app.tell(app.getDict().a_sr_000)
            }
            return respondWithDetail(app, details[0])
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

/**
 * Responds with a list of weapons available and a text about the next or current schedule.
 */
function respondWithDetail(app: I18NDialogflowApp, detail: Detail) {
    if (detail.weapons.length < 4) {
        console.error('less than four weapons in salmon run info')
        return app.tell(app.getDict().a_sr_000)
    }
    const info = mapDetailToInfo(detail, nowInSplatFormat(), app.getDict())
    
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
                info.weapons.map(weapon => 
                    buildWeaponOptionItem(app, weapon))))
}

function buildWeaponOptionItem(app: I18NDialogflowApp, weaponInfo: WeaponInfo): Responses.OptionItem {
    const optionKey = buildOptionKey(weaponInfo.name)
    return app.buildOptionItem(optionKey, [weaponInfo.name])
        .setTitle(weaponInfo.name)
        .setImage(weaponInfo.image, weaponInfo.name)
}