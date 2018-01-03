import { Dict } from '../../i18n/I18NDialogflowApp'
import { secondsToTime } from '../../common/utils'
import { Schedule } from '../../entity/api/Schedules'
import { getSplatnetResUrl } from '../../data/Splatoon2inkApi'

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

export function mapScheduleToInfo(schedule: Schedule, now: number, dict: Dict): ScheduleInfo {
    const timeDiff = schedule.start_time - now
    return {
        modeName: dict.api_sched_mode(schedule.game_mode),
        ruleName: dict.api_sched_rule(schedule.rule),
        stageA: {
            name: dict.api_sched_stage(schedule.stage_a),
            image: getSplatnetResUrl(schedule.stage_a.image)
        },
        stageB: {
            name: dict.api_sched_stage(schedule.stage_b),
            image: getSplatnetResUrl(schedule.stage_b.image)
        },
        timeDiff: timeDiff,
        timeString: secondsToTime(timeDiff)
    }
}