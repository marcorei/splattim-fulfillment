import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { ArgParser } from '../util/dfUtils'
import { StageArg } from '../model/StageArg'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { ScheduleInfo, mapScheduleToInfo } from '../../../procedure/transform/SchedulesMapper'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { Responses } from 'actions-on-google'
import { ContentDict } from '../../../i18n/ContentDict'
import { Dict } from '../../../i18n/Dict'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'

export const name = 'stage_schedule'

export function handler(app: I18NDialogflowApp) {
    const argParser = new ArgParser(app)
    const requestedStage = argParser.int(StageArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    new SchedulesAggregator(app.getLang())
        .schedulesWithStage(requestedStage)
        .then(result => respondWithSchedules(app, result.contentDict, result.content, requestedStage))
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
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