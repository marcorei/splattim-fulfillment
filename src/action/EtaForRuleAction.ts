import { isNullOrUndefined } from 'util';
import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp';
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Schedule, Stage, GameMode, Rule } from '../entity/api/Schedules'
import { GameModeArg } from '../entity/dialog/GameModeArg'
import { GameRuleArg } from '../entity/dialog/GameRuleArg'
import { secondsToTime, sortByStartTime } from '../common/utils'

export const name = 'eta_rule'

export function handler(app: I18NDialogflowApp) {
    const gameModeArgValue = app.getArgument(GameModeArg.key) // Required
    const gameRuleArgValue = app.getArgument(GameRuleArg.key) // Required
    if (isNullOrUndefined(gameModeArgValue)) {
        console.error('required parameter is missing: ' + GameModeArg.key)
        app.tell(app.getDict().global_error_missing_param)
        return
    }
    if (isNullOrUndefined(gameRuleArgValue)) {
        console.error('required parameter is missing: ' + GameRuleArg.key)
        app.tell(app.getDict().global_error_missing_param)
        return
    }
    const requestedGameMode = gameModeArgValue.toString()
    const requestedGameRule = gameRuleArgValue.toString()

    switch (requestedGameMode) {
        case GameModeArg.values.league:
        case GameModeArg.values.ranked:
            break
        case GameModeArg.values.all:
            app.tell(app.getDict().a_eta_error_incomp_mode_all)
            return
        case GameModeArg.values.regular:
            app.tell(app.getDict().a_eta_error_incomp_mode_regular)
            return
        default: 
            app.tell(app.getDict().a_eta_error_unknown_mode)
            return
    }
    let ruleMatchString: string
    switch (requestedGameRule) {
        case GameRuleArg.values.blitz:
            ruleMatchString = 'clam_blitz'
            break
        case GameRuleArg.values.rainmaker:
            ruleMatchString = 'rainmaker'
            break
        case GameRuleArg.values.tower:
            ruleMatchString = 'tower_control'
            break
        case GameRuleArg.values.zones:
            ruleMatchString = 'splat_zones'
            break
        case GameRuleArg.values.turf:
            app.tell(app.getDict().a_eta_error_incomp_mode_regular)
            return
        default:
            app.tell(app.getDict().a_eta_error_unknown_rule)
            return
    }

    return new Splatoon2inkApi().getSchedules()
        .then(schedules => requestedGameMode == GameModeArg.values.league ?
                schedules.league :
                schedules.gachi)
        .then(schedules => schedules
            .filter(schedule => {
                return schedule.rule.key === ruleMatchString
            })
            .sort(sortByStartTime)
        )
        .then(schedules => {
            if (schedules.length === 0) {
                app.tell(app.getDict().a_eta_000)
            } else {
                respondWithSchedule(app,schedules[0])
            }
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

// Responder 

function respondWithSchedule(app: I18NDialogflowApp, schedule: Schedule) {
    const gameMode = app.getDict().api_sched_mode(schedule.game_mode)
    const gameRule = app.getDict().api_sched_rule(schedule.rule)

    const now = Math.round(new Date().getTime() / 1000)
    const eta = now >= schedule.start_time ? 
        app.getDict().a_eta_001_now : 
        app.getDict().a_eta_001_future + secondsToTime(schedule.start_time - now)
    return app.askWithList({
        speech: app.getDict().a_eta_002_s(
            gameRule,
            gameMode,
            eta),
        displayText: app.getDict().a_eta_002_t(
            gameRule,
            gameMode,
            eta)
    },
    app.buildList(app.getDict().a_sched_003(gameMode))
        .addItems([
            buildStageOptionItem(app, schedule.stage_a, schedule.rule),
            buildStageOptionItem(app, schedule.stage_b, schedule.rule)
        ]))
}

// Item Builder

function buildStageOptionItem(app: I18NDialogflowApp, stage: Stage, rule: Rule, mode?: GameMode): Responses.OptionItem {
    const ruleName = app.getDict().api_sched_rule(rule)
    const stageName = app.getDict().api_sched_stage(stage)
    const desc = !isNullOrUndefined(mode) ? 
    app.getDict().api_sched_mode(mode) + ' - ' + ruleName : 
        ruleName
    return app.buildOptionItem('STAGE_' + stage.id, [stageName])
        .setTitle(stageName)
        .setDescription(desc)
        .setImage(config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + stage.image, stage.name)
}