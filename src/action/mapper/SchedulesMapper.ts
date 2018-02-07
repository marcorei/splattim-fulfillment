import { secondsToTime } from '../../common/utils'
import { Schedule } from '../../entity/api/Schedules'
import { getSplatnetResUrl } from '../../data/Splatoon2inkApi'
import { ContentDict } from '../../i18n/ContentDict';

export interface StageInfo {
    name: string,
    image: string
}

export interface ScheduleInfo {
    modeName: string,
    ruleName: string,
    stageA: StageInfo,
    stageB: StageInfo,
    timeDiff: number,
    timeString: string
}

export function mapScheduleToInfo(schedule: Schedule, now: number, contentDict: ContentDict): ScheduleInfo {
    const timeDiff = schedule.start_time - now
    return {
        modeName: contentDict.mode(schedule.game_mode),
        ruleName: contentDict.rule(schedule.rule),
        stageA: {
            name: contentDict.schedStage(schedule.stage_a),
            image: getSplatnetResUrl(schedule.stage_a.image)
        },
        stageB: {
            name: contentDict.schedStage(schedule.stage_b),
            image: getSplatnetResUrl(schedule.stage_b.image)
        },
        timeDiff: timeDiff,
        timeString: secondsToTime(timeDiff)
    }
}