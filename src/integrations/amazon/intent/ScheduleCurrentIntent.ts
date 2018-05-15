import { HandlerInput } from 'ask-sdk-core'
import { Response, interfaces } from 'ask-sdk-model'
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
import { HandlerHelper, CanHandleHelper } from '../util/HandlerHelper'
import { ListItemBuilder } from '../util/ListItemBuilder'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('RequestStagesCurrent')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {

        // No dialog model since slot is optional
        const slotParser = new SlotParser(input, helper.dict)
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
        const stages = [info.stageA, info.stageB]
        const listItems = stages.map((stage, index) => 
            buildStageListItem(index, helper.dict, info, stage, false))

        helper.addTemplate({
            type: 'ListTemplate1',
            token: 'stageList',
            title: helper.dict.a_sched_006,
            listItems: listItems
        })
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
        const listItems = infos
            .map((info, index) => [
                buildStageListItem(index, helper.dict, info, info.stageA, true),
                buildStageListItem(index, helper.dict, info, info.stageB, true)
            ])
            .reduce((prev, next) => prev.concat(next))

        helper.addTemplate({
            type: 'ListTemplate1',
            token: 'stageList',
            title: helper.dict.a_sched_006,
            listItems: listItems
        })
    }

    return helper.emit()
}

function buildStageListItem(index: number, dict: Dict, info: ScheduleInfo, stageInfo: StageInfo, useMode: boolean) : interfaces.display.ListItem {
    const desc = useMode ? 
        `${info.modeName} - ${info.ruleName}` : 
        info.ruleName
    return new ListItemBuilder(`${stageInfo.name}_${index}`)
        .addImage(stageInfo.image)
        .addPlainText(stageInfo.name, desc)
        .build()
}

