import * as Alexa from 'alexa-sdk'
import { Dict } from '../DictProvider'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { ScheduleInfo, StageInfo, mapScheduleToInfo, buildCurrentStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { GameModeSlot } from '../model/GameModeSlot'
import { isNullOrUndefined } from 'util'
import { config } from '../../../config'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'RequestStagesCurrent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    // Nop dialog model since slot is optional
    const slotParser = new SlotParser(this, helper.dict)
    const requestedGameMode = slotParser.stringWithDefault(GameModeSlot.key, GameModeSlot.values.all)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    var modeKey: string
    if (requestedGameMode == GameModeSlot.values.all) {
        modeKey = GameModeSlot.values.all
    } else {
        const converter = new Converter()
        modeKey = converter.modeToApi(requestedGameMode)
    }
    return new SchedulesAggregator(helper.lang).currentSchedulesForModeOrAll(modeKey)
        .then(result => {
            const helperW = helper.withContentDict(result.contentDict)
            if (result.content.length > 1) {
                return respondWithoutSpecificSchedule(helperW, result.content)
            }
            return respondWithSchedule(helperW, result.content[0])
        })
        .catch(error => {
            console.error(error)
            return helper.speakRplcEmit(helper.dict.global_error_default)
        })
}

function respondWithSchedule(helper: HandlerHelper, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        return helper.speakRplcEmit(helper.dict.a_sched_000_s(config.splatoonInk.baseUrl))
    }

    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), helper.contentDict, secondsToTime)

    helper.speakRplc(helper.dict.a_sched_002_a(
        info.ruleName,
        info.modeName,
        info.stageA.name,
        info.stageB.name,
        wrapTimeString(info.timeStringEnd)))

    if (helper.hasDisplay()) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        const stages = [info.stageA, info.stageB]
        stages.forEach((stage, index) => buildStageListItem(listItemBuilder, helper.dict, info, stage, false))

        const template = new Alexa.templateBuilders.ListTemplate1Builder()
            .setToken('stageList')
            .setTitle(helper.dict.a_sched_006)
            .setListItems(listItemBuilder.build())
            .build()
        helper.handler.response.renderTemplate(template)
    }

    return helper.emit()
}

function respondWithoutSpecificSchedule(helper: HandlerHelper, schedules: Schedule[]) {
    const now = nowInSplatFormat()
    const infos: ScheduleInfo[] = schedules
        .filter(schedule => schedule != null)
        .map(schedule => mapScheduleToInfo(schedule!, now, helper.contentDict, secondsToTime))
    
    helper.speakRplc(buildCurrentStageSpeechOverview(helper.dict, infos, false))

    if (helper.hasDisplay()) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        infos.forEach((info, index) => {
            buildStageListItem(listItemBuilder, helper.dict, info, info.stageA, true)
            buildStageListItem(listItemBuilder, helper.dict, info, info.stageB, true)
        })

        const template = new Alexa.templateBuilders.ListTemplate1Builder()
            .setToken('stageList')
            .setTitle(helper.dict.a_sched_006)
            .setListItems(listItemBuilder.build())
            .build()
        helper.handler.response.renderTemplate(template)
    }

    return helper.emit()
}

function buildStageListItem(builder: Alexa.templateBuilders.ListItemBuilder, dict: Dict, info: ScheduleInfo, stageInfo: StageInfo, useMode: boolean) {
    const desc = useMode ? 
        `${info.modeName} - ${info.ruleName}` : 
        info.ruleName
    return builder.addItem(
        Alexa.utils.ImageUtils.makeImage(stageInfo.image),
        stageInfo.name,
        Alexa.utils.TextUtils.makePlainText(stageInfo.name),
        Alexa.utils.TextUtils.makePlainText(desc)
    )
}

