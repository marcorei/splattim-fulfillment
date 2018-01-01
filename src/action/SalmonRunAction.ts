import { isNullOrUndefined } from 'util'
import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp';
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Detail, Weapon } from '../entity/api/SalmonRunSchedules'
import { secondsToTime } from '../common/utils'

export const name = 'next_grizzco'

export function handler(app: I18NDialogflowApp) {
    return new Splatoon2inkApi().getSalmonRunSchedules()
        .then(schedules => schedules.details
            .sort((a, b) => {
                if (a.start_time === b.start_time) return 0;
                return a.start_time > b.start_time ? 1 : -1
            }))
        .then(details => {
            if (details.length === 0) {
                app.tell(app.getDict().a_sr_000)
                return
            }
            respondWithDetail(app, details[0])
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

// Responder

function respondWithDetail(app: I18NDialogflowApp, detail: Detail) {
    const now = Math.round(new Date().getTime() / 1000)

    const stageString = app.getDict().api_grizz_stage(detail.stage)
    const eta = secondsToTime(detail.start_time - now)
    
    return app.askWithCarousel({
            speech: now >= detail.start_time ?
                app.getDict().a_sr_002_s(stageString) :
                app.getDict().a_sr_003_s(stageString, eta),
            displayText: now >= detail.start_time ?
                app.getDict().a_sr_002_t(stageString) :
                app.getDict().a_sr_003_t(stageString, eta)},
        app.buildCarousel()
            .addItems(
                detail.weapons.map(weapon => 
                    buildWeaponOptionItem(app, weapon))))
}

// Item Builder

function buildWeaponOptionItem(app: I18NDialogflowApp, weapon: Weapon | null): Responses.OptionItem {
    const weaponId = isNullOrUndefined(weapon) ? '?' + Math.round(Math.random() * 10000) : weapon.id
    const weaponName = isNullOrUndefined(weapon) ? '?' : app.getDict().api_grizz_weapon(weapon)
    const weaponImage = isNullOrUndefined(weapon) ? 'https://splatoon2.ink/assets/img/salmon-run-random-weapon.46415a.png' : 
        config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + weapon.image
    return app.buildOptionItem('WEAPON_' + weaponId, [weaponName])
        .setTitle(weaponName)
        .setImage(weaponImage, weaponName)
}