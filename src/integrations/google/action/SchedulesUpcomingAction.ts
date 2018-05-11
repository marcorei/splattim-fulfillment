import { isNullOrUndefined } from 'util'
import { Carousel, GoogleActionsV2UiElementsCarouselSelectCarouselItem, SimpleResponse } from 'actions-on-google'
import { CustomConversation } from '../util/CustomConversation'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { GameModeArg } from '../model/GameModeArg'
import { sortByStartTime, nowInSplatFormat } from '../../../util/utils'
import { ArgParser } from '../util/ArgParser'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from '../../../procedure/transform/SchedulesMapper'
import { ContentDict } from '../../../i18n/ContentDict'
import { Converter } from '../util/Converter'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { secondsToTime } from '../util/utils'

export const name = 'all_schedules'

/**
 * Lists current and future stages for a given game mode as carousel.
 * Asks on which stage the user wants to get splatted.
 */
export function handler(conv: CustomConversation) {
    const argParser = new ArgParser(conv)
    const requestedGameMode = argParser.string(GameModeArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    if (requestedGameMode == GameModeArg.values.all) {
        return conv.close(conv.dict.a_asched_error_too_much)
    }

    const converter = new Converter()
    const modeKey = converter.modeToApi(requestedGameMode)
    return new SchedulesAggregator(conv.lang)
        .scheduleForMode(modeKey)
        .then(result => respondWithSchedules(conv, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

/**
 * Responds by providing a carousel of stages.
 * The carousel includes all stages while the speech response features only two.
 */
function respondWithSchedules(conv: CustomConversation, contentDict: ContentDict, schedules: Schedule[]) {
    if (isNullOrUndefined(schedules) || schedules.length < 2) {
        return conv.close(conv.dict.a_asched_error_empty_data)
    }

    const gameModeName = contentDict.mode(schedules[0].game_mode)
    const now = nowInSplatFormat()
    const scheduleInfos: ScheduleInfo[] = schedules
        .sort(sortByStartTime)
        .map(schedule => mapScheduleToInfo(schedule, now, contentDict, secondsToTime))

    if (!conv.hasDisplay()) {
        return conv.close(conv.dict.a_asched_000_a(
            gameModeName,
            scheduleInfos[0].ruleName,
            scheduleInfos[0].stageA.name,
            scheduleInfos[0].stageB.name,
            scheduleInfos[1].ruleName,
            scheduleInfos[1].timeStringStart,
            scheduleInfos[1].stageA.name,
            scheduleInfos[1].stageB.name))
    }

    conv.ask(new SimpleResponse({
        speech: conv.dict.a_asched_000_s(
            gameModeName,
            scheduleInfos[0].ruleName,
            scheduleInfos[0].stageA.name,
            scheduleInfos[0].stageB.name,
            scheduleInfos[1].ruleName,
            scheduleInfos[1].timeStringStart,
            scheduleInfos[1].stageA.name,
            scheduleInfos[1].stageB.name),
        text: conv.dict.a_asched_000_t(gameModeName)
    }))

    return conv.ask(new Carousel({
        items: scheduleInfos.reduce((arr: GoogleActionsV2UiElementsCarouselSelectCarouselItem[], info) => {
            arr.push(
                buildStageOptionItem(conv, info.stageA, info),
                buildStageOptionItem(conv, info.stageB, info))
            return arr
        }, [])
    }))
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(conv: CustomConversation, stageInfo: StageInfo, info: ScheduleInfo) : GoogleActionsV2UiElementsCarouselSelectCarouselItem {
    const etaTimeString = info.timeDiffStart <= 0 ? 
        conv.dict.a_asched_001_now :
        conv.dict.a_asched_001_future + info.timeStringStart

    return {
        optionInfo: {
            key: buildOptionKey(stageInfo.name, undefined, info.timeDiffStart),
            synonyms: [stageInfo.name]
        },
        title: `${stageInfo.name} - ${etaTimeString}`,
        description: info.ruleName,
        image: {
            url: stageInfo.image,
            accessibilityText: stageInfo.name
        }
    }
}
