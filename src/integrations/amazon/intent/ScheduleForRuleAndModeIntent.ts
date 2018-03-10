import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { ContentDict } from '../../../i18n/ContentDict'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { GameModeSlot } from '../model/GameModeSlot'
import { Converter } from '../util/Converter'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from '../../../procedure/transform/SchedulesMapper'
import { GameRuleSlot } from '../model/GameRuleSlot'
import { secondsToTime, wrapTimeString } from '../util/utils'

export const name = 'RequestScheduleForRuleAndMode'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, dict)
    const requestedGameMode = slotParser.string(GameModeSlot.key)
    const requestedGameRule = slotParser.string(GameRuleSlot.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    switch (requestedGameMode) {
        case GameModeSlot.values.league:
        case GameModeSlot.values.ranked:
            break
        case GameModeSlot.values.all:
            this.response.speak(dict.a_eta_error_incomp_mode_all)
            return this.emit(':responseReady')
        case GameModeSlot.values.regular:
            this.response.speak(dict.a_eta_error_incomp_mode_regular)
            return this.emit(':responseReady')
        default: 
            this.response.speak(dict.a_eta_error_unknown_mode)
            return this.emit(':responseReady')
    }

    switch (requestedGameRule) {
        case GameRuleSlot.values.blitz:
        case GameRuleSlot.values.rainmaker:
        case GameRuleSlot.values.tower:
        case GameRuleSlot.values.zones:

            const converter = new Converter()
            const modeKey = converter.modeToApi(requestedGameMode)
            const ruleKey = converter.ruleToApi(requestedGameRule)

            return new SchedulesAggregator(dictProvider.getLang())
                .scheduleForModeAndRule(modeKey, ruleKey)
                .then(result => {
                    if (result.content.length === 0) {
                        this.response.speak(dict.a_eta_000)
                        return this.emit(':responseReady')
                    } else {
                        return respondWithSchedule(this, dict, result.contentDict, result.content[0])
                    }
                })
                .catch(error => {
                    console.error(error)
                    this.response.speak(dict.global_error_default)
                    return this.emit(':responseReady')
                })

        case GameRuleSlot.values.turf:
            this.response.speak(dict.a_eta_error_incomp_mode_regular)
            return this.emit(':responseReady')
        default:
            this.response.speak(dict.a_eta_error_unknown_rule)
            return this.emit(':responseReady')
    }
}

function respondWithSchedule(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, schedule: Schedule) {
    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), contentDict, secondsToTime)
    const eta = info.timeString === '' ? 
        dict.a_eta_001_now : 
        dict.a_eta_001_future + wrapTimeString(info.timeString)

    handler.response.speak(dict.a_eta_002_a(
        info.ruleName,
        info.modeName,
        eta,
        info.stageA.name,
        info.stageB.name
    ))

    if (handler.event.context.System.device.supportedInterfaces.Display) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        const stages = [info.stageA, info.stageB]
        stages.forEach((stage, index) => buildStageListItem(listItemBuilder, dict, info, stage, false))

        const template = new Alexa.templateBuilders.ListTemplate1Builder()
            .setToken('stageList')
            .setTitle(dict.a_sched_006)
            .setListItems(listItemBuilder.build())
            .build()
        handler.response.renderTemplate(template)
    }

    return handler.emit(':responseReady')
}

function buildStageListItem(builder: Alexa.templateBuilders.ListItemBuilder, dict: Dict, info: ScheduleInfo, stageInfo: StageInfo, useMode: boolean) {
    return builder.addItem(
        Alexa.utils.ImageUtils.makeImage(stageInfo.image),
        stageInfo.name,
        Alexa.utils.TextUtils.makePlainText(stageInfo.name),
        Alexa.utils.TextUtils.makePlainText(info.ruleName)
    )
}