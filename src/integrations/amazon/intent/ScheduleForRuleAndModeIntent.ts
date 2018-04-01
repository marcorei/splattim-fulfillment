import * as Alexa from 'alexa-sdk'
import { Dict } from '../DictProvider'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { GameModeSlot } from '../model/GameModeSlot'
import { Converter } from '../util/Converter'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from '../../../procedure/transform/SchedulesMapper'
import { GameRuleSlot } from '../model/GameRuleSlot'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'RequestScheduleForRuleAndMode'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    if (this.event.request['dialogState'] !== 'COMPLETED') {
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, helper.dict)
    const requestedGameMode = slotParser.string(GameModeSlot.key)
    const requestedGameRule = slotParser.string(GameRuleSlot.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    switch (requestedGameMode) {
        case GameModeSlot.values.league:
        case GameModeSlot.values.ranked:
            break
        case GameModeSlot.values.all:
            return helper.speakRplcEmit(helper.dict.a_eta_error_incomp_mode_all)
        case GameModeSlot.values.regular:
            return helper.speakRplcEmit(helper.dict.a_eta_error_incomp_mode_regular)
        default: 
            return helper.speakRplcEmit(helper.dict.a_eta_error_unknown_mode)
    }

    switch (requestedGameRule) {
        case GameRuleSlot.values.blitz:
        case GameRuleSlot.values.rainmaker:
        case GameRuleSlot.values.tower:
        case GameRuleSlot.values.zones:

            const converter = new Converter()
            const modeKey = converter.modeToApi(requestedGameMode)
            const ruleKey = converter.ruleToApi(requestedGameRule)

            return new SchedulesAggregator(helper.lang)
                .scheduleForModeAndRule(modeKey, ruleKey)
                .then(result => {
                    if (result.content.length === 0) {
                        return helper.speakRplcEmit(helper.dict.a_eta_000)
                    } else {
                        return respondWithSchedule(helper.withContentDict(result.contentDict), result.content[0])
                    }
                })
                .catch(error => {
                    console.error(error)
                    return helper.speakRplcEmit(helper.dict.global_error_default)
                })

        case GameRuleSlot.values.turf:
            return helper.speakRplcEmit(helper.dict.a_eta_error_incomp_mode_regular)
        default:
            return helper.speakRplcEmit(helper.dict.a_eta_error_unknown_rule)
    }
}

function respondWithSchedule(helper: HandlerHelper, schedule: Schedule) {
    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), helper.contentDict, secondsToTime)
    const eta = info.timeStringStart === '' ? 
        helper.dict.a_eta_001_now : 
        helper.dict.a_eta_001_future + wrapTimeString(info.timeStringStart)

    helper.speakRplc(helper.dict.a_eta_002_a(
        info.ruleName,
        info.modeName,
        eta,
        info.stageA.name,
        info.stageB.name
    ))

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

function buildStageListItem(builder: Alexa.templateBuilders.ListItemBuilder, dict: Dict, info: ScheduleInfo, stageInfo: StageInfo, useMode: boolean) {
    return builder.addItem(
        Alexa.utils.ImageUtils.makeImage(stageInfo.image),
        stageInfo.name,
        Alexa.utils.TextUtils.makePlainText(stageInfo.name),
        Alexa.utils.TextUtils.makePlainText(info.ruleName)
    )
}