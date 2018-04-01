import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { ArgParser } from '../util/ArgParser'
import { StageArg } from '../model/StageArg'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { ScheduleInfo, mapScheduleToInfo, buildScheduleForStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { Responses } from 'actions-on-google'
import { ContentDict } from '../../../i18n/ContentDict'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { secondsToTime } from '../util/utils'

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
    const infos = schedules.map(schedule => mapScheduleToInfo(schedule, now, contentDict, secondsToTime))

    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT) || 
        infos.length == 1) {
        return app.tell(buildScheduleForStageSpeechOverview(dict, infos, requestedStageName, false))
    }

    return app.askWithList({
            speech: buildScheduleForStageSpeechOverview(dict, infos, requestedStageName, true),
            displayText: dict.a_ssched_001_t(requestedStageName)
        }, 
        app.buildList(requestedStageName)
            .addItems(infos.map(info => buildStageOptionItem(app, info, requestedStageName))))
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(app: I18NDialogflowApp, info: ScheduleInfo, stageName: string): Responses.OptionItem {
    const desc = `${info.ruleName} in ${info.modeName}`
    const optionKey = buildOptionKey(stageName, info.modeName, info.timeDiffStart)
    const timeInfo = info.timeDiffStart > 0 ? 
        `in ${info.timeStringStart}` : 
        app.getDict().a_ssched_004

    return app.buildOptionItem(optionKey, [timeInfo, info.modeName])
        .setTitle(timeInfo)
        .setDescription(desc)
}