import { isNullOrUndefined } from 'util'
import { CustomConversation } from '../util/CustomConversation'
import { SimpleResponse, GoogleActionsV2UiElementsCarouselSelectCarouselItem, GoogleActionsV2UiElementsListSelectListItem, List, RichResponse, LinkOutSuggestion, Carousel } from 'actions-on-google'
import { config } from '../../../config'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { GameModeArg } from '../model/GameModeArg'
import { nowInSplatFormat } from '../../../util/utils'
import { ArgParser } from '../util/ArgParser'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ScheduleInfo, StageInfo, mapScheduleToInfo, buildCurrentStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { ContentDict } from '../../../i18n/ContentDict'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { Converter } from '../util/Converter'
import { secondsToTime } from '../util/utils'

export const names = ['Request - Schedule Current']

/**
 * Lists the current stages of either one game mode, or all current stages
 * of all game modes.
 * Either as carousel for all modes, or as list for a specific mode.
 * Asks a follow up question about the preferred satge.
 */
export function handler(conv: CustomConversation) {
    const argParser = new ArgParser(conv)
    const requestedGameMode = argParser.stringWithDefault(GameModeArg.key, GameModeArg.values.all)
    if (!argParser.isOk()) return argParser.tellAndLog()

    var modeKey: string
    if (requestedGameMode == GameModeArg.values.all) {
        modeKey = GameModeArg.values.all
    } else {
        const converter = new Converter()
        modeKey = converter.modeToApi(requestedGameMode)
    }
    return new SchedulesAggregator(conv.lang).currentSchedulesForModeOrAll(modeKey)
        .then(result => {
            if (result.content.length > 1) {
                return respondWithoutSpecificSchedule(conv, result.contentDict, result.content)
            }
            return respondWithSchedule(conv, result.contentDict, result.content[0])
        })
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

/**
 * Responds by showing two stages of a given schedule in a list.
 */
function respondWithSchedule(conv: CustomConversation, contentDict: ContentDict, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        return conv.close(new RichResponse()
            .add(new SimpleResponse({
                speech: conv.dict.a_sched_000_s(config.splatoonInk.baseUrl),
                text: conv.dict.a_sched_000_t
            }))
            .add(new LinkOutSuggestion({
                name: 'Splatoon.ink',
                url: config.splatoonInk.baseUrl
            })))
    }

    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), contentDict, secondsToTime)

    if (!conv.hasDisplay) {
        return conv.close(conv.dict.a_sched_002_a(
            info.ruleName,
            info.modeName,
            info.stageA.name,
            info.stageB.name,
            info.timeStringEnd))
    }

    conv.ask(new SimpleResponse({
        speech: conv.dict.a_sched_002_s(
            info.ruleName,
            info.modeName,
            info.stageA.name,
            info.stageB.name),
        text: conv.dict.a_sched_002_t(
            info.ruleName,
            info.modeName)
    }))

    return conv.ask(new List({
        title: conv.dict.a_sched_003(info.modeName, info.timeStringEnd),
        items: [
            buildStageOptionItem(conv, info, info.stageA, false),
            buildStageOptionItem(conv, info, info.stageB, false)
        ]
    }))
}

/**
 * Reponds by showing all stages of all active schedules in a carousel.
 */
function respondWithoutSpecificSchedule(conv: CustomConversation, contentDict: ContentDict, schedules: Schedule[]) {
    const now = nowInSplatFormat()
    const infos: ScheduleInfo[] = schedules
        .filter(schedule => schedule != null)
        .map(schedule => mapScheduleToInfo(schedule!, now, contentDict, secondsToTime))
    
    if (!conv.hasDisplay) {
        return conv.close(buildCurrentStageSpeechOverview(conv.dict, infos, false))
    }

    conv.ask(new SimpleResponse({
        speech: buildCurrentStageSpeechOverview(conv.dict, infos, true),
        text: conv.dict.a_sched_004
    }))

    return conv.ask(new Carousel({
        items: infos.reduce((arr: GoogleActionsV2UiElementsCarouselSelectCarouselItem[], info) => {
            arr.push(
                buildStageOptionItem(conv, info, info.stageA, true),
                buildStageOptionItem(conv, info, info.stageB, true)
            )
            return arr
        }, [])
    }))
}

type OptionItem = GoogleActionsV2UiElementsCarouselSelectCarouselItem & GoogleActionsV2UiElementsListSelectListItem

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(conv: CustomConversation, info: ScheduleInfo, stageInfo: StageInfo, useMode: boolean) : OptionItem {
    return {
        optionInfo: {
            key: buildOptionKey(stageInfo.name, info.modeName, info.timeDiffStart),
            synonyms: [stageInfo.name]
        },
        title: stageInfo.name,
        description: useMode ? 
            `${info.modeName} - ${info.ruleName}` : 
            info.ruleName,
        image: {
            url: stageInfo.image,
            accessibilityText: stageInfo.name
        }
    }
}

