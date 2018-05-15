import { GoogleActionsV2UiElementsListSelectListItem, SimpleResponse, List } from 'actions-on-google'
import { CustomConversation } from '../util/CustomConversation'
import { ArgParser } from '../util/ArgParser'
import { StageArg } from '../model/StageArg'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { ScheduleInfo, mapScheduleToInfo, buildScheduleForStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ContentDict } from '../../../i18n/ContentDict'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { secondsToTime } from '../util/utils'

export const names = ['Request - Schedule for Stage']

export function handler(conv: CustomConversation) {
    const argParser = new ArgParser(conv)
    const requestedStage = argParser.int(StageArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    return new SchedulesAggregator(conv.lang)
        .schedulesWithStage(requestedStage)
        .then(result => respondWithSchedules(conv, result.contentDict, result.content, requestedStage))
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

/**
 * Responds by showing a list of upcoming modes.
 */
function respondWithSchedules(conv: CustomConversation, contentDict: ContentDict, schedules: Schedule[], stageId: number) {
    const dict = conv.dict
    const requestedStageName = contentDict.schedStageId(stageId.toString())

    if (schedules.length == 0) {
        return conv.close(dict.a_ssched_000(requestedStageName))
    }

    const now = nowInSplatFormat()
    const infos = schedules.map(schedule => mapScheduleToInfo(schedule, now, contentDict, secondsToTime))

    if (!conv.hasDisplay || 
        infos.length == 1) {
        return conv.close(buildScheduleForStageSpeechOverview(dict, infos, requestedStageName, false))
    }

    conv.ask(new SimpleResponse({
        speech: buildScheduleForStageSpeechOverview(dict, infos, requestedStageName, true),
        text: dict.a_ssched_001_t(requestedStageName)
    }))

    return conv.ask(new List({
        title: requestedStageName,
        items: infos.map(info => buildStageOptionItem(conv, info, requestedStageName))
    }))
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(conv: CustomConversation, info: ScheduleInfo, stageName: string) : GoogleActionsV2UiElementsListSelectListItem {
    const timeInfo = info.timeDiffStart > 0 ? 
        `in ${info.timeStringStart}` : 
        conv.dict.a_ssched_004
    return {
        optionInfo: {
            key: buildOptionKey(stageName, info.modeName, info.timeDiffStart),
            synonyms: [timeInfo, info.modeName]
        },
        title: timeInfo,
        description: `${info.ruleName} in ${info.modeName}`
    }
}