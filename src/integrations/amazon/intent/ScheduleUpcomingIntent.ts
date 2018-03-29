import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { ContentDict } from '../../../i18n/ContentDict'
import { sortByStartTime, nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from '../../../procedure/transform/SchedulesMapper'
import { GameModeSlot } from '../model/GameModeSlot'
import { isNullOrUndefined } from 'util'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { AttributeHelper } from '../util/Attributes'

export const name = 'RequestStagesUpcoming'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    new AttributeHelper(this).updateLastSeen()
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, dict)
    const requestedGameMode = slotParser.string(GameModeSlot.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    const converter = new Converter()
    const modeKey = converter.modeToApi(requestedGameMode)
    return new SchedulesAggregator(dictProvider.getLang())
        .scheduleForMode(modeKey)
        .then(result => respondWithSchedules(this, dict, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            this.response.speak(dict.global_error_default)
            return this.emit(':responseReady')
        })
}


function respondWithSchedules(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, schedules: Schedule[]) {
    if (isNullOrUndefined(schedules) || schedules.length < 2) {
        handler.response.speak(dict.a_asched_error_empty_data)
        return handler.emit(':responseReady')
    }

    const gameModeName = contentDict.mode(schedules[0].game_mode)
    const now = nowInSplatFormat()
    const scheduleInfos: ScheduleInfo[] = schedules
        .sort(sortByStartTime)
        .map(schedule => mapScheduleToInfo(schedule, now, contentDict, secondsToTime))

    handler.response.speak(dict.a_asched_000_a(
        gameModeName,
        scheduleInfos[0].ruleName,
        scheduleInfos[0].stageA.name,
        scheduleInfos[0].stageB.name,
        scheduleInfos[1].ruleName,
        wrapTimeString(scheduleInfos[1].timeString),
        scheduleInfos[1].stageA.name,
        scheduleInfos[1].stageB.name))

    if (handler.event.context.System.device.supportedInterfaces.Display) {
        const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder()
        scheduleInfos.forEach((info, index) => {
            buildStageListItem(listItemBuilder, dict, info, info.stageA) 
            buildStageListItem(listItemBuilder, dict, info, info.stageB)    
        })

        const template = new Alexa.templateBuilders.ListTemplate2Builder()
            .setToken('stageList')
            .setTitle(dict.a_sched_006)
            .setListItems(listItemBuilder.build())
            .build()
        handler.response.renderTemplate(template)
    }

    return handler.emit(':responseReady')
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