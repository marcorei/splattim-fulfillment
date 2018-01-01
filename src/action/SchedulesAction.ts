import { isNullOrUndefined } from 'util'
import { I18NDialogflowApp, Dict } from '../i18n/I18NDialogflowApp';
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Schedules, Schedule, Stage, GameMode, Rule } from '../entity/api/Schedules'
import { GameModeArg } from '../entity/dialog/GameModeArg'
import { OptionItem } from 'actions-on-google/response-builder'

export const name = 'schedules'

export function handler(app: I18NDialogflowApp) {
    const gameModeArgValue = app.getArgument(GameModeArg.key)
    const requestedGameMode: string = !isNullOrUndefined(gameModeArgValue) ? gameModeArgValue.toString() : GameModeArg.values.all

    return new Splatoon2inkApi().getSchedules()
        .then(schedules => {
            switch (requestedGameMode) {
                case GameModeArg.values.regular:
                    respondWithSchedule(app, getCurrentSchedule(schedules.regular))
                    break
                case GameModeArg.values.ranked:
                    respondWithSchedule(app, getCurrentSchedule(schedules.gachi))
                    break
                case GameModeArg.values.league:
                    respondWithSchedule(app,  getCurrentSchedule(schedules.league))
                    break
                case GameModeArg.values.all:
                default:
                    respondWithoutSpecificSchedule(app, schedules)
            }
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

// Reponder

function respondWithSchedule(app: I18NDialogflowApp, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        app.tell(app.buildRichResponse()
            .addSimpleResponse({
                speech: app.getDict().a_sched_000_s(config.splatoonInk.baseUrl),
                displayText: app.getDict().a_sched_000_t
            })
            .addSuggestionLink('Splatoon.ink', config.splatoonInk.baseUrl))
        return
    }
    const gameMode = app.getDict().api_sched_mode(schedule.game_mode)
    const gameRule = app.getDict().api_sched_rule(schedule.rule)
    return app.askWithList({
            speech: app.getDict().a_sched_002_s(
                gameRule,
                gameMode,
                app.getDict().api_grizz_stage(schedule.stage_a),
                app.getDict().api_sched_stage(schedule.stage_b)),
            displayText: app.getDict().a_sched_002_t(
                gameRule,
                gameMode)
        },
        app.buildList(app.getDict().a_sched_003(gameMode))
            .addItems([
                buildStageOptionItem(app, schedule.stage_a, schedule.rule),
                buildStageOptionItem(app, schedule.stage_b, schedule.rule)
            ]))
}

function respondWithoutSpecificSchedule(app: I18NDialogflowApp, schedules: Schedules) {
    const currentSchedules: Schedule[] = [schedules.regular, schedules.gachi, schedules.league]
        .map(schedules => getCurrentSchedule(schedules))
        .filter(schedule => schedule != null) as Schedule[]
    
    app.askWithCarousel({
            speech: buildOverviewSpeech(app.getDict(), currentSchedules),
            displayText: app.getDict().a_sched_004
        }, 
        app.buildCarousel()
            .addItems(currentSchedules.reduce((arr: OptionItem[], schedule) => {
                arr.push(
                    buildStageOptionItem(app, schedule.stage_a, schedule.rule, schedule.game_mode),
                    buildStageOptionItem(app, schedule.stage_b, schedule.rule, schedule.game_mode)
                )
                return arr
            }, [])))
}

// Item Builder

function buildOverviewSpeech(dict: Dict, schedules: Schedule[]): string {
    let output = dict.a_sched_005_start
    schedules.forEach((schedule, index, all) => {
        switch (index) {
            case 0: output += ' '; break;
            case all.length - 1: output += dict.a_sched_005_connector; break;
            default: output += ', '; break;
        }
        const mode = dict.api_sched_mode(schedule.game_mode)
        const stage1 = dict.api_sched_stage(schedule.stage_a)
        const stage2 = dict.api_sched_stage(schedule.stage_b)
        output += dict.a_sched_005_middle(mode, stage1, stage2)
    })
    output += dict.a_sched_005_end
    return output
}

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

// Helper

function getCurrentSchedule(schedules: [Schedule]): Schedule | null {
    if (isNullOrUndefined(schedules) || schedules.length === 0) return null
    const sortedSchedules = schedules.sort((a, b) => {
        if (a.start_time === b.start_time) return 0;
        return a.start_time > b.start_time ? 1 : -1
    })
    return sortedSchedules[0]
}