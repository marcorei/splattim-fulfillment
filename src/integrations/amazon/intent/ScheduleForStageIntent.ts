import { HandlerInput } from 'ask-sdk-core'
import { Response, interfaces } from 'ask-sdk-model'
import { Dict } from '../DictProvider'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { ScheduleInfo, mapScheduleToInfo, buildScheduleForStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { StageSlot } from '../model/StageSlot'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper, CanHandleHelper } from '../util/HandlerHelper'
import { ListItemBuilder } from '../util/ListItemBuilder'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('RequestScheduleForStage')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        
        if (helper.isIncompleteIntent()) return helper.delegate()
        const slotParser = new SlotParser(input, helper.dict)
        const requestedStage = slotParser.int(StageSlot.key)
        if (!slotParser.isOk()) return slotParser.tellAndLog()

        return new SchedulesAggregator(helper.lang)
            .schedulesWithStage(requestedStage)
            .then(result => respondWithSchedules(helper.withContentDict(result.contentDict), result.content, requestedStage))
            .catch(error => {
                console.error(error)
                return helper.speakRplcEmit(helper.dict.global_error_default)
            })

    })
}

function respondWithSchedules(helper: HandlerHelper, schedules: Schedule[], stageId: number) {
    const requestedStageName = helper.contentDict.schedStageId(stageId.toString())

    if (schedules.length == 0) {
        return helper.speakRplcEmit(helper.dict.a_ssched_000(requestedStageName))
    }

    const now = nowInSplatFormat()
    const infos = schedules.map(schedule => mapScheduleToInfo(schedule, now, helper.contentDict, secondsToTime))

    helper.speakRplc(buildScheduleForStageSpeechOverview(helper.dict, infos, requestedStageName, false, wrapTimeString))

    if (helper.hasDisplay() && infos.length > 0) {
        const listItems = infos.map(info => buildStageListItem(helper.dict, info, requestedStageName))

        helper.addTemplate({
            type: 'ListTemplate1',
            token: 'stageList',
            title: helper.dict.a_sched_006,
            listItems: listItems
        })
    }

    return helper.emit()
}

function buildStageListItem(dict: Dict, info: ScheduleInfo, stageName: string) : interfaces.display.ListItem {
    const desc = `${info.ruleName} in ${info.modeName}`
    const timeInfo = info.timeDiffStart > 0 ? 
        `in ${info.timeStringStart}` : 
        dict.a_ssched_004
    return new ListItemBuilder(`${stageName}_${timeInfo}_${info.modeName}`)
        .addPlainText(timeInfo, desc)
        .build()
}

