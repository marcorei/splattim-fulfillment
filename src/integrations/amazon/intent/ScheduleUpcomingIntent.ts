import * as Alexa from 'alexa-sdk'
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
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'RequestStagesUpcoming'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, helper.dict)
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
        wrapTimeString(scheduleInfos[1].timeString),
        scheduleInfos[1].stageA.name,
        scheduleInfos[1].stageB.name))

    if (helper.hasDisplay()) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        scheduleInfos.forEach((info, index) => {
            buildStageListItem(listItemBuilder, helper.dict, info, info.stageA) 
            buildStageListItem(listItemBuilder, helper.dict, info, info.stageB)    
        })

        const template = new Alexa.templateBuilders.ListTemplate2Builder()
            .setToken('stageList')
            .setTitle(helper.dict.a_sched_006)
            .setListItems(listItemBuilder.build())
            .build()
        helper.handler.response.renderTemplate(template)
    }

    return helper.emit()
}

function buildStageListItem(builder: Alexa.templateBuilders.ListItemBuilder, dict: Dict, info: ScheduleInfo, stageInfo: StageInfo) {
    const etaTimeString = info.timeDiff <= 0 ? 
        dict.a_asched_001_now :
        dict.a_asched_001_future + info.timeString

    return builder.addItem(
        Alexa.utils.ImageUtils.makeImage(stageInfo.image),
        `${stageInfo.name}_${info.timeDiff}`,
        Alexa.utils.TextUtils.makePlainText(`${stageInfo.name} - ${etaTimeString}`),
        Alexa.utils.TextUtils.makePlainText(info.ruleName)
    )
}