import { Dict } from '../../i18n/I18NDialogflowApp'
import { secondsToTime } from '../../common/utils'
import { getSplatnetResUrl } from '../../data/Splatoon2inkApi'
import { Merchandise } from '../../entity/api/Gear'

export interface MerchInfo {
    merchName: string,
    merchImage: string,
    brandName: string,
    skillName: string,
    timeDiff: number,
    timeString: string
}

export function mapMerchandiseToInfo(merch: Merchandise, now: number, dict: Dict): MerchInfo {
    const timeDiff = merch.end_time - now
    return {
        merchName: dict.api_gear_item(merch.gear),
        merchImage: getSplatnetResUrl(merch.gear.image),
        brandName: dict.api_gear_brand(merch.gear.brand),
        skillName: dict.api_gear_skill(merch.skill),
        timeDiff: timeDiff,
        timeString: secondsToTime(timeDiff)
    }
}