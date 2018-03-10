import { SecondsToTimeType } from '../../util/utils'
import { Schedule } from '../../splatoon2ink/model/Schedules'
import { getSplatnetResUrl } from '../../splatoon2ink/Splatoon2inkApi'
import { ContentDict } from '../../i18n/ContentDict'
import { Dict } from '../../i18n/Dict'
import { isNullOrUndefined } from 'util';

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

export function mapScheduleToInfo(schedule: Schedule, now: number, contentDict: ContentDict, secondsToTime: SecondsToTimeType): ScheduleInfo {
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

/**
 * For an overview of current stages:
 * Builds a string containing all stages of the given StageInfos 
 * intended for a spoken overview.
 */
export function buildCurrentStageSpeechOverview(dict: Dict, infos: ScheduleInfo[], appendQuestion: boolean): string {
    let output = dict.a_sched_005_start
    infos.forEach((info, index, all) => {
        switch (index) {
            case 0: 
                output += ' ' 
                break
            case all.length - 1: 
                output += dict.a_sched_005_connector 
                break
            default: 
                output += ', '
        }
        output += dict.a_sched_005_middle(info.modeName, info.stageA.name, info.stageB.name)
    })
    if (appendQuestion) {
        output += dict.a_sched_005_end
    } else {
        output += '!'
    }
    return output
}

/**
 * For an overview of the availability of a certain stage.
 * Builds a string containing all stages. Meant for a spoken overview.
 */
export function buildScheduleForStageSpeechOverview(dict: Dict, infos: ScheduleInfo[], stageName: string, appendQuestion: boolean, wrapTime?: (input: string) => string): string {
    let output = dict.a_ssched_002_start(stageName)
    infos.forEach((info, index, all) => {
        switch (index) {
            case 0: 
                output += ' ' 
                break
            case all.length - 1: 
                output += dict.a_ssched_002_connector
                break
            default: 
                output += ', '
        }
        const timeString: string = isNullOrUndefined(wrapTime) ? 
            info.timeString :
            wrapTime(info.timeString)
        output += info.timeDiff > 0 ? 
            dict.a_ssched_002_middle(info.ruleName, info.modeName, timeString) :
            dict.a_ssched_002_middle_now(info.ruleName, info.modeName)
    })
    if (appendQuestion) {
        output += dict.a_ssched_002_end
    } else {
        output += '.'
    }
    return output
}