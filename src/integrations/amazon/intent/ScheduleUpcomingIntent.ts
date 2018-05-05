import { HandlerInput } from 'ask-sdk-core'
import { Response, interfaces } from 'ask-sdk-model'
import { Dict } from '../DictProvider'
import { sortByStartTime, nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from '../../../procedure/transform/SchedulesMapper'
import { GameModeSlot } from '../model/GameModeSlot'
import { isNullOrUndefined } from 'util'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper, CanHandleHelper } from '../util/HandlerHelper'
import { ListItemBuilder } from '../util/DisplayTemplateUtil'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('RequestStagesUpcoming')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        
        if (helper.isIncompleteIntent()) return helper.delegate()
        const slotParser = new SlotParser(input, helper.dict)
        const requestedGameMode = slotParser.string(GameModeSlot.key)
        if (!slotParser.isOk()) return slotParser.tellAndLog()

        const converter = new Converter()
        const modeKey = converter.modeToApi(requestedGameMode)
        return new SchedulesAggregator(helper.lang)
            .scheduleForMode(modeKey)
            .then(result => respondWithSchedules(helper.withContentDict(result.contentDict), result.content))
            .catch(error => {
                console.error(error)
                return helper.speakRplcEmit(helper.dict.global_error_default)
            })

    })
}

function respondWithSchedules(helper: HandlerHelper, schedules: Schedule[]) {
    if (isNullOrUndefined(schedules) || schedules.length < 2) {
        return helper.speakRplcEmit(helper.dict.a_asched_error_empty_data)
    }

    const gameModeName = helper.contentDict.mode(schedules[0].game_mode)
    const now = nowInSplatFormat()
    const scheduleInfos: ScheduleInfo[] = schedules
        .sort(sortByStartTime)
        .map(schedule => mapScheduleToInfo(schedule, now, helper.contentDict, secondsToTime))

    helper.speakRplc(helper.dict.a_asched_000_a(
        gameModeName,
        scheduleInfos[0].ruleName,
        scheduleInfos[0].stageA.name,
        scheduleInfos[0].stageB.name,
        scheduleInfos[1].ruleName,
        wrapTimeString(scheduleInfos[1].timeStringStart),
        scheduleInfos[1].stageA.name,
        scheduleInfos[1].stageB.name))

    if (helper.hasDisplay()) {
        const listItems = scheduleInfos
            .map(info => [
                buildStageListItem(helper.dict, info, info.stageA),
                buildStageListItem(helper.dict, info, info.stageB)  
            ])
            .reduce((prev, next) => prev.concat(next))
        
        helper.addTemplate({
            type: 'ListTemplate2',
            token: 'stageList',
            title: helper.dict.a_sched_006,
            listItems: listItems
        })
    }

    return helper.emit()
}

function buildStageListItem(dict: Dict, info: ScheduleInfo, stageInfo: StageInfo) : interfaces.display.ListItem {
    const etaTimeString = info.timeDiffStart <= 0 ? 
        dict.a_asched_001_now :
        dict.a_asched_001_future + info.timeStringStart
    return new ListItemBuilder(`${stageInfo.name}_${info.timeDiffStart}`)
        .addImage(stageInfo.image)
        .addPlainText(`${stageInfo.name} - ${etaTimeString}`, info.ruleName)
        .build()
}