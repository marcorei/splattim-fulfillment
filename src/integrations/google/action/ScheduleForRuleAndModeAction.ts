import { CustomConversation } from '../util/CustomConversation'
import { SimpleResponse, GoogleActionsV2UiElementsListSelectListItem, List } from 'actions-on-google'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { GameModeArg } from '../model/GameModeArg'
import { GameRuleArg } from '../model/GameRuleArg'
import { Converter } from '../util/Converter'
import { nowInSplatFormat } from '../../../util/utils'
import { ArgParser } from '../util/ArgParser'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from '../../../procedure/transform/SchedulesMapper'
import { ContentDict } from '../../../i18n/ContentDict'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { secondsToTime } from '../util/utils'

export const names = ['Request - Schedule for Rule and Mode']

/**
 * Lists the stages for next schedule that matches both the mode and rule given.
 * Reponds with a list.
 * Asks a followup question about the maps.
 */
export function handler(conv: CustomConversation) {
    const converter = new Converter()
    const argParser = new ArgParser(conv)
    const requestedGameMode = argParser.string(GameModeArg.key)
    const requestedGameRule = argParser.string(GameRuleArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    switch (requestedGameMode) {
        case GameModeArg.values.league:
        case GameModeArg.values.ranked:
            break
        case GameModeArg.values.all:
            return conv.close(conv.dict.a_eta_error_incomp_mode_all)
        case GameModeArg.values.regular:
            return conv.close(conv.dict.a_eta_error_incomp_mode_regular)
        default: 
            return conv.close(conv.dict.a_eta_error_unknown_mode)
    }

    switch (requestedGameRule) {
        case GameRuleArg.values.blitz:
        case GameRuleArg.values.rainmaker:
        case GameRuleArg.values.tower:
        case GameRuleArg.values.zones:

            const ruleKey = converter.ruleToApi(requestedGameRule)
            const modeKey = converter.modeToApi(requestedGameMode)

            return new SchedulesAggregator(conv.lang)
                .scheduleForModeAndRule(modeKey, ruleKey)
                .then(result => {
                    if (result.content.length === 0) {
                        return conv.close(conv.dict.a_eta_000)
                    } else {
                        return respondWithSchedule(conv, result.contentDict, result.content[0])
                    }
                })
                .catch(error => {
                    console.error(error)
                    conv.close(conv.dict.global_error_default)
                })

        case GameRuleArg.values.turf:
            return conv.close(conv.dict.a_eta_error_incomp_mode_regular)
        default:
            return conv.close(conv.dict.a_eta_error_unknown_rule)
    }
}

/**
 * Reponds by showing two stges in a list format.
 */
function respondWithSchedule(conv: CustomConversation, contentDict: ContentDict, schedule: Schedule) {
    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), contentDict, secondsToTime)
    const eta = info.timeStringStart === '' ? 
        conv.dict.a_eta_001_now : 
        conv.dict.a_eta_001_future + info.timeStringStart

    if (!conv.hasDisplay) {
        return conv.close(conv.dict.a_eta_002_a(
            info.ruleName,
            info.modeName,
            eta,
            info.stageA.name,
            info.stageB.name))
    }

    conv.ask(new SimpleResponse({
        speech: conv.dict.a_eta_002_s(
            info.ruleName,
            info.modeName,
            eta,
            info.stageA.name,
            info.stageB.name),
        text: conv.dict.a_eta_002_t(
            info.ruleName,
            info.modeName,
            eta)
    }))
    return conv.ask(new List({
        title: conv.dict.a_eta_003,
        items: [
            buildStageOptionItem(conv, info, info.stageA),
            buildStageOptionItem(conv, info, info.stageB)
        ]
    }))
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(conv: CustomConversation, info: ScheduleInfo, stageInfo: StageInfo) : GoogleActionsV2UiElementsListSelectListItem {
    return {
        optionInfo: {
            key: buildOptionKey(stageInfo.name, info.modeName, info.timeDiffStart),
            synonyms: [stageInfo.name]
        },
        title: stageInfo.name,
        description: info.ruleName,
        image: {
            url: stageInfo.image,
            accessibilityText: stageInfo.name
        }
    }
}