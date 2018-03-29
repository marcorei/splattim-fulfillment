import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { ContentDict } from '../../../i18n/ContentDict'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { ScheduleInfo, mapScheduleToInfo, buildScheduleForStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { StageSlot } from '../model/StageSlot'
import { ImageFreeItemBuilder } from '../util/ImageFreeItemBuilder'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { AttributeHelper } from '../util/Attributes'

export const name = 'RequestScheduleForStage'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    new AttributeHelper(this).updateLastSeen()
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, dict)
    const requestedStage = slotParser.int(StageSlot.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    new SchedulesAggregator(dictProvider.getLang())
        .schedulesWithStage(requestedStage)
        .then(result => respondWithSchedules(this, dict, result.contentDict, result.content, requestedStage))
        .catch(error => {
            console.error(error)
            this.response.speak(dict.global_error_default)
            return this.emit(':responseReady')
        })
}

function respondWithSchedules(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, schedules: Schedule[], stageId: number) {
    const requestedStageName = contentDict.schedStageId(stageId.toString())

    if (schedules.length == 0) {
        handler.response.speak(dict.a_ssched_000(requestedStageName))
        return handler.emit(':responseReady')
    }

    const now = nowInSplatFormat()
    const infos = schedules.map(schedule => mapScheduleToInfo(schedule, now, contentDict, secondsToTime))

    handler.response.speak(buildScheduleForStageSpeechOverview(dict, infos, requestedStageName, false, wrapTimeString))

    if (handler.event.context.System.device.supportedInterfaces.Display && infos.length > 0) {
        const listItemBuilder = new ImageFreeItemBuilder()
        infos.forEach((info, index) => buildStageListItem(listItemBuilder, dict, info, requestedStageName))

        const template = new Alexa.templateBuilders.ListTemplate1Builder()
            .setToken('stageList')
            .setTitle(dict.a_sched_006)
            .setListItems(listItemBuilder.build())
            .build()
        handler.response.renderTemplate(template)
    }

    return handler.emit(':responseReady')
}

function buildStageListItem(builder: ImageFreeItemBuilder, dict: Dict, info: ScheduleInfo, stageName: string) {
    const desc = `${info.ruleName} in ${info.modeName}`
    const timeInfo = info.timeDiff > 0 ? 
        `in ${info.timeString}` : 
        dict.a_ssched_004
    return builder.addItemNoImage(
        `${stageName}_${timeInfo}_${info.modeName}`,
        Alexa.utils.TextUtils.makePlainText(timeInfo),
        Alexa.utils.TextUtils.makePlainText(desc)
    )
}

