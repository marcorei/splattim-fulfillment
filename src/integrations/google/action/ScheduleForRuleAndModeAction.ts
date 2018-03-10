import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { Responses } from 'actions-on-google'
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

export const name = 'eta_rule'

/**
 * Lists the stages for next schedule that matches both the mode and rule given.
 * Reponds with a list.
 * Asks a followup question about the maps.
 */
export function handler(app: I18NDialogflowApp) {
    const converter = new Converter()
    const argParser = new ArgParser(app)
    const requestedGameMode = argParser.string(GameModeArg.key)
    const requestedGameRule = argParser.string(GameRuleArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    switch (requestedGameMode) {
        case GameModeArg.values.league:
        case GameModeArg.values.ranked:
            break
        case GameModeArg.values.all:
            return app.tell(app.getDict().a_eta_error_incomp_mode_all)
        case GameModeArg.values.regular:
            return app.tell(app.getDict().a_eta_error_incomp_mode_regular)
        default: 
            return app.tell(app.getDict().a_eta_error_unknown_mode)
    }

    switch (requestedGameRule) {
        case GameRuleArg.values.blitz:
        case GameRuleArg.values.rainmaker:
        case GameRuleArg.values.tower:
        case GameRuleArg.values.zones:

            const ruleKey = converter.ruleToApi(requestedGameRule)
            const modeKey = converter.modeToApi(requestedGameMode)

            return new SchedulesAggregator(app.getLang())
                .scheduleForModeAndRule(modeKey, ruleKey)
                .then(result => {
                    if (result.content.length === 0) {
                        return app.tell(app.getDict().a_eta_000)
                    } else {
                        return respondWithSchedule(app, result.contentDict, result.content[0])
                    }
                })
                .catch(error => {
                    console.error(error)
                    app.tell(app.getDict().global_error_default)
                })

        case GameRuleArg.values.turf:
            return app.tell(app.getDict().a_eta_error_incomp_mode_regular)
        default:
            return app.tell(app.getDict().a_eta_error_unknown_rule)
    }
}

/**
 * Reponds by showing two stges in a list format.
 */
function respondWithSchedule(app: I18NDialogflowApp, contentDict: ContentDict, schedule: Schedule) {
    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), contentDict, secondsToTime)
    const eta = info.timeString === '' ? 
        app.getDict().a_eta_001_now : 
        app.getDict().a_eta_001_future + info.timeString

    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(app.getDict().a_eta_002_a(
            info.ruleName,
            info.modeName,
            eta,
            info.stageA.name,
            info.stageB.name))
    }
    
    return app.askWithList({
            speech: app.getDict().a_eta_002_s(
                info.ruleName,
                info.modeName,
                eta,
                info.stageA.name,
                info.stageB.name),
            displayText: app.getDict().a_eta_002_t(
                info.ruleName,
                info.modeName,
                eta)
        },
        app.buildList(app.getDict().a_eta_003)
            .addItems([
                buildStageOptionItem(app, info, info.stageA),
                buildStageOptionItem(app, info, info.stageB)
            ]))
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(app: I18NDialogflowApp, info: ScheduleInfo, stageInfo: StageInfo): Responses.OptionItem {
    const optionKey = buildOptionKey(stageInfo.name, info.modeName, info.timeDiff)

    return app.buildOptionItem(optionKey, [stageInfo.name])
        .setTitle(stageInfo.name)
        .setDescription(info.ruleName)
        .setImage(stageInfo.image, stageInfo.name)
}