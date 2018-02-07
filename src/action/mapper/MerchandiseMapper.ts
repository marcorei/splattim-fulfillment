import { secondsToTime } from '../../common/utils'
import { getSplatnetResUrl } from '../../data/Splatoon2inkApi'
import { Merchandise } from '../../entity/api/Gear'
import { ContentDict } from '../../i18n/ContentDict'

export interface MerchInfo {
    merchName: string,
    merchImage: string,
    brandName: string,
    skillName: string,
    timeDiff: number,
    timeString: string
}

export function mapMerchandiseToInfo(merch: Merchandise, now: number, contentDict: ContentDict): MerchInfo {
    const timeDiff = merch.end_time - now
    return {
        merchName: contentDict.gear(merch.gear),
        merchImage: getSplatnetResUrl(merch.gear.image),
        brandName: contentDict.brand(merch.gear.brand),
        skillName: contentDict.skill(merch.skill),
        timeDiff: timeDiff,
        timeString: secondsToTime(timeDiff)
    }
}