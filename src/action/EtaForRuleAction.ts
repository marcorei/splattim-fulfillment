import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp';
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi, getSplatnetResUrl } from '../data/Splatoon2inkApi'
import { Schedule } from '../entity/api/Schedules'
import { GameModeArg } from '../entity/dialog/GameModeArg'
import { GameRuleArg } from '../entity/dialog/GameRuleArg'
import { gameRuleArgToApi } from '../entity/Converter'
import { sortByStartTime, nowInSplatFormat } from '../common/utils'
import { ArgParser } from '../common/dfUtils';
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from './mapper/SchedulesMapper'

export const name = 'eta_rule'

/**
 * Lists the stages for next schedule that matches both the mode and rule given.
 * Reponds with a list.
 * Asks a followup question about the maps.
 */
export function handler(app: I18NDialogflowApp) {
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

            const ruleKey = gameRuleArgToApi(requestedGameRule)
            return new Splatoon2inkApi().readSchedules()
                .then(schedules => requestedGameMode == GameModeArg.values.league ?
                        schedules.league :
                        schedules.gachi)
                .then(schedules => schedules
                    .filter(schedule => {
                        return schedule.rule.key === ruleKey
                    })
                    .sort(sortByStartTime)
                )
                .then(schedules => {
                    if (schedules.length === 0) {
                        app.tell(app.getDict().a_eta_000)
                    } else {
                        respondWithSchedule(app, schedules[0])
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
function respondWithSchedule(app: I18NDialogflowApp, schedule: Schedule) {
    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), app.getDict())
    const eta = info.timeString === '' ? 
        app.getDict().a_eta_001_now : 
        app.getDict().a_eta_001_future + info.timeString
    
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
        .setImage(getSplatnetResUrl(stageInfo.image), stageInfo.name)
}