import { I18NDialogflowApp, Dict } from '../i18n/I18NDialogflowApp'
import { ArgParser } from '../common/dfUtils'
import { StageArg } from '../entity/dialog/StageArg'
import { sortByStartTime, nowInSplatFormat } from '../common/utils'
import { Schedule } from '../entity/api/Schedules'
import { isNullOrUndefined } from 'util'
import { ScheduleInfo, mapScheduleToInfo } from './mapper/SchedulesMapper'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { Responses } from 'actions-on-google'
import { I18NSplatoon2API } from '../i18n/I18NSplatoon2Api'
import { ContentDict } from '../i18n/ContentDict'

export const name = 'stage_schedule'

export function handler(app: I18NDialogflowApp) {
    const argParser = new ArgParser(app)
    const requestedStage = argParser.int(StageArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    return new I18NSplatoon2API(app).readSchedules()
        .then(result => {
            Promise.resolve(result.content)
                .then(schedules => [
                    findStageIn(schedules.league, requestedStage),
                    findStageIn(schedules.gachi, requestedStage),
                    findStageIn(schedules.regular, requestedStage)]
                    .filter(schedule => !isNullOrUndefined(schedule))
                    .map(schedule => schedule as Schedule) // not undefined!
                    .sort(sortByStartTime))
                .then((schedules) => respondWithSchedules(app, result.contentDict, schedules, requestedStage))
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

function findStageIn(schedules: Schedule[], stage: number) : Schedule | undefined {
    return schedules
        .sort(sortByStartTime)
        .find(schedule => parseInt(schedule.stage_a.id) == stage ||
                parseInt(schedule.stage_b.id) == stage)
}

/**
 * Responds by showing a list of upcoming modes.
 */
function respondWithSchedules(app: I18NDialogflowApp, contentDict: ContentDict, schedules: Schedule[], stageId: number) {
    const dict = app.getDict()
    const requestedStageName = contentDict.schedStageId(stageId.toString())

    if (schedules.length == 0) {
        return app.tell(dict.a_ssched_000(requestedStageName))
    }

    const now = nowInSplatFormat()
    const infos = schedules.map(schedule => mapScheduleToInfo(schedule, now, contentDict))

    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(buildSpeechOverview(dict, infos, requestedStageName, false))
    }

    return app.askWithList({
            speech: buildSpeechOverview(dict, infos, requestedStageName, true),
            displayText: dict.a_ssched_001_t(requestedStageName)
        }, 
        app.buildList(requestedStageName)
            .addItems(infos.map(info => buildStageOptionItem(app, info, requestedStageName))))
}

/**
 * Builds a string containing all stages. Meant for a spoken overview.
 */
function buildSpeechOverview(dict: Dict, infos: ScheduleInfo[], stageName: string, appendQuestion: boolean): string {
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
        output += info.timeDiff > 0 ? 
            dict.a_ssched_002_middle(info.ruleName, info.modeName, info.timeString) :
            dict.a_ssched_002_middle_now(info.ruleName, info.modeName)
    })
    if (appendQuestion) {
        output += dict.a_ssched_002_end
    } else {
        output += '.'
    }
    return output
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(app: I18NDialogflowApp, info: ScheduleInfo, stageName: string): Responses.OptionItem {
    const desc = `${info.ruleName} in ${info.modeName}`
    const optionKey = buildOptionKey(stageName, info.modeName, info.timeDiff)
    const timeInfo = info.timeDiff > 0 ? 
        `in ${info.timeString}` : 
        app.getDict().a_ssched_004

    return app.buildOptionItem(optionKey, [timeInfo, info.modeName])
        .setTitle(timeInfo)
        .setDescription(desc)
}