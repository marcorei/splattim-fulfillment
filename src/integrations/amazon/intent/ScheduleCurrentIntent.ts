import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { ContentDict } from '../../../i18n/ContentDict'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { ScheduleInfo, StageInfo, mapScheduleToInfo, buildCurrentStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { GameModeSlot } from '../model/GameModeSlot'
import { isNullOrUndefined } from 'util'
import { config } from '../../../config'
import { secondsToTime } from '../util/utils'

export const name = 'RequestStagesCurrent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    // Nop dialog model since slot is optional
    const slotParser = new SlotParser(this, dict)
    const requestedGameMode = slotParser.stringWithDefault(GameModeSlot.key, GameModeSlot.values.all)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    var modeKey: string
    if (requestedGameMode == GameModeSlot.values.all) {
        modeKey = GameModeSlot.values.all
    } else {
        const converter = new Converter()
        modeKey = converter.modeToApi(requestedGameMode)
    }
    return new SchedulesAggregator(dictProvider.getLang()).currentSchedulesForModeOrAll(modeKey)
        .then(result => {
            if (result.content.length > 1) {
                return respondWithoutSpecificSchedule(this, dict, result.contentDict, result.content)
            }
            return respondWithSchedule(this, dict, result.contentDict, result.content[0])
        })
        .catch(error => {
            console.error(error)
            this.response.speak(dict.global_error_default)
            return this.emit(':responseReady')
        })
}

function respondWithSchedule(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        handler.response.speak(dict.a_sched_000_s(config.splatoonInk.baseUrl))
        return handler.emit(':responseReady')
    }

    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), contentDict, secondsToTime)

    handler.response.speak(dict.a_sched_002_a(
        info.ruleName,
        info.modeName,
        info.stageA.name,
        info.stageB.name))

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

function respondWithoutSpecificSchedule(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, schedules: Schedule[]) {
    const now = nowInSplatFormat()
    const infos: ScheduleInfo[] = schedules
        .filter(schedule => schedule != null)
        .map(schedule => mapScheduleToInfo(schedule!, now, contentDict, secondsToTime))
    
    handler.response.speak(buildCurrentStageSpeechOverview(dict, infos, false))

    if (handler.event.context.System.device.supportedInterfaces.Display) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        infos.forEach((info, index) => {
            buildStageListItem(listItemBuilder, dict, info, info.stageA, true)
            buildStageListItem(listItemBuilder, dict, info, info.stageB, true)
        })

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

