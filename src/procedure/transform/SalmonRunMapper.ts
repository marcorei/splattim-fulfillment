import { isNullOrUndefined } from 'util'
import { SecondsToTimeType } from '../../util/utils'
import { getSplatnetResUrl } from '../../splatoon2ink/Splatoon2inkApi'
import { Detail } from '../../splatoon2ink/model/SalmonRunSchedules'
import { ContentDict } from '../../i18n/ContentDict'
import { Dict } from '../../i18n/Dict'

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

export function mapDetailToInfo(detail: Detail, now: number, dict:Dict, contentDict: ContentDict, secondsToTime: SecondsToTimeType): DetailInfo {
    const open = now >= detail.start_time
    const timeDiff = open ? detail.end_time - now : detail.start_time - now
    return {
        open: open,
        timeString: secondsToTime(timeDiff),
        stageName: contentDict.coopStage(detail.stage),
        weapons: detail.weapons.map(weapon => {
            if (isNullOrUndefined(weapon)) {
                return {
                    name: dict.a_sr_004,
                    image: 'https://splatoon2.ink/assets/img/salmon-run-random-weapon.46415a.png'
                }
            }
            return {
                name: contentDict.weapon(weapon.weapon),
                image: getSplatnetResUrl(weapon.weapon.image)
            }
        })
    }
}

export function removeDuplicateWeapons(weapons: WeaponInfo[]): WeaponInfo[] {
    const uniqueWeaponsLookup: {[id: string] : boolean} = {}
    return weapons.filter(weapon => {
        if (isNullOrUndefined(uniqueWeaponsLookup[weapon.name])) {
            uniqueWeaponsLookup[weapon.name] = true
            return true
        }
        return false
    })
}