import { isNullOrUndefined } from 'util';
import { DialogflowApp, Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Schedule, Stage, GameMode, Rule } from '../model/api/Schedules'
import { GameModeArg } from '../model/dialog/GameModeArg'
import { GameRuleArg } from '../model/dialog/GameRuleArg'
import { getDict, Dict } from '../i18n/resolver'
import { secondsToTime } from '../common/utils'

export const name = 'eta_rule'

export function handler(app: DialogflowApp) {
    const dict: Dict = getDict(app)
    const gameModeArgValue = app.getArgument(GameModeArg.key) // Required
    const gameRuleArgValue = app.getArgument(GameRuleArg.key) // Required
    if (isNullOrUndefined(gameModeArgValue)) {
        console.error('required parameter is missing: ' + GameModeArg.key)
        app.tell(dict.global_error_missing_param)
        return
    }
    if (isNullOrUndefined(gameRuleArgValue)) {
        console.error('required parameter is missing: ' + GameRuleArg.key)
        app.tell(dict.global_error_missing_param)
        return
    }
    const requestedGameMode = gameModeArgValue.toString()
    const requestedGameRule = gameRuleArgValue.toString()

    switch (requestedGameMode) {
        case GameModeArg.values.league:
        case GameModeArg.values.ranked:
            break
        case GameModeArg.values.all:
            app.tell(dict.a_eta_error_incomp_mode_all)
            return
        case GameModeArg.values.regular:
            app.tell(dict.a_eta_error_incomp_mode_regular)
            return
        default: 
            app.tell(dict.a_eta_error_unknown_mode)
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
            app.tell(dict.a_eta_error_incomp_mode_regular)
            return
        default:
            app.tell(dict.a_eta_error_unknown_rule)
            return
    }

    return new Splatoon2inkApi().getSchedules()
        .then(schedules => requestedGameMode ==  GameModeArg.values.league ?
                schedules.league :
                schedules.gachi)
        .then(schedules => schedules
            .filter(schedule => {
                return schedule.rule.key === ruleMatchString
            })
            .sort((a, b) => {
                if (a.start_time === b.start_time) return 0;
                return a.start_time > b.start_time ? 1 : -1
            })
        )
        .then(schedules => {
            if (schedules.length === 0) {
                app.tell(dict.a_eta_000)
            } else {
                respondWithSchedule(app, dict, schedules[0])
            }
        })
        .catch(error => {
            console.error(error)
            app.tell(dict.global_error_default)
        })
}

// Responder 

function respondWithSchedule(app: DialogflowApp, dict: Dict, schedule: Schedule) {
    const gameMode = dict.api_sched_mode(schedule.game_mode.key, schedule.game_mode.name)
    const gameRule = dict.api_sched_rule(schedule.rule.key, schedule.rule.name)

    const now = Math.round(new Date().getTime() / 1000)
    const eta = now >= schedule.start_time ? 
        dict.a_eta_001_now : 
        dict.a_eta_001_future + secondsToTime(schedule.start_time - now)
    return app.askWithList({
        speech: dict.a_eta_002_s(
            gameRule,
            gameMode,
            eta),
        displayText: dict.a_eta_002_t(
            gameRule,
            gameMode,
            eta)
    },
    app.buildList(dict.a_sched_003(gameMode))
        .addItems([
            buildStageOptionItem(app, dict, schedule.stage_a, schedule.rule),
            buildStageOptionItem(app, dict, schedule.stage_b, schedule.rule)
        ]))
}

// Item Builder

function buildStageOptionItem(app: DialogflowApp, dict: Dict, stage: Stage, rule: Rule, mode?: GameMode): Responses.OptionItem {
    const ruleName = dict.api_sched_rule(rule.key, rule.name)
    const stageName = dict.api_sched_stage(stage.id, stage.name)
    const desc = !isNullOrUndefined(mode) ? 
        dict.api_sched_mode(mode.key, mode.name) + ' - ' + ruleName : 
        ruleName
    return app.buildOptionItem('STAGE_' + stage.id, [stageName])
        .setTitle(stageName)
        .setDescription(desc)
        .setImage(config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + stage.image, stage.name)
}