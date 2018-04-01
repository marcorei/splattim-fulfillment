import * as Alexa from 'alexa-sdk'
import { Dict } from '../DictProvider'
import { nowInSplatFormat } from '../../../util/utils'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { SlotParser } from '../util/SlotParser'
import { ScheduleInfo, mapScheduleToInfo, buildScheduleForStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { StageSlot } from '../model/StageSlot'
import { ImageFreeItemBuilder } from '../util/ImageFreeItemBuilder'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'RequestScheduleForStage'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, helper.dict)
    const requestedStage = slotParser.int(StageSlot.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    new SchedulesAggregator(helper.lang)
        .schedulesWithStage(requestedStage)
        .then(result => respondWithSchedules(helper.withContentDict(result.contentDict), result.content, requestedStage))
        .catch(error => {
            console.error(error)
            return helper.speakRplcEmit(helper.dict.global_error_default)
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
        const listItemBuilder = new ImageFreeItemBuilder()
        infos.forEach((info, index) => buildStageListItem(listItemBuilder, helper.dict, info, requestedStageName))

        const template = new Alexa.templateBuilders.ListTemplate1Builder()
            .setToken('stageList')
            .setTitle(helper.dict.a_sched_006)
            .setListItems(listItemBuilder.build())
            .build()
        helper.handler.response.renderTemplate(template)
    }

    return helper.emit()
}

function buildStageListItem(builder: ImageFreeItemBuilder, dict: Dict, info: ScheduleInfo, stageName: string) {
    const desc = `${info.ruleName} in ${info.modeName}`
    const timeInfo = info.timeDiffStart > 0 ? 
        `in ${info.timeStringStart}` : 
        dict.a_ssched_004
    return builder.addItemNoImage(
        `${stageName}_${timeInfo}_${info.modeName}`,
        Alexa.utils.TextUtils.makePlainText(timeInfo),
        Alexa.utils.TextUtils.makePlainText(desc)
    )
}

