import { isNullOrUndefined } from 'util'
import { Dict } from '../../i18n/I18NDialogflowApp'
import { secondsToTime } from '../../common/utils'
import { getSplatnetResUrl } from '../../data/Splatoon2inkApi'
import { Detail } from '../../entity/api/SalmonRunSchedules'

export interface DetailInfo {
    open: boolean,
    timeString: string,
    stageName: string,
    weapons: WeaponInfo[]
}

export interface WeaponInfo {
    name: string,
    image: string
}

export function mapDetailToInfo(detail: Detail, now: number, dict: Dict): DetailInfo {
    const open = now >= detail.start_time
    const timeDiff = open ? detail.end_time - now : detail.start_time - now
    return {
        open: open,
        timeString: secondsToTime(timeDiff),
        stageName: dict.api_grizz_stage(detail.stage),
        weapons: detail.weapons.map(weapon => {
            if (isNullOrUndefined(weapon)) {
                return {
                    name: dict.a_sr_004,
                    image: 'https://splatoon2.ink/assets/img/salmon-run-random-weapon.46415a.png'
                }
            }
            return {
                name: dict.api_grizz_weapon(weapon),
                image: getSplatnetResUrl(weapon.image)
            }
        })
    }
}