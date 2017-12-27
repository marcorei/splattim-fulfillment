import { isNullOrUndefined } from 'util'
import { DialogflowApp, Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Schedules, Schedule, Stage, GameMode, Rule } from '../model/api/Schedules'
import { GameModeArg } from '../model/dialog/GameModeArg'
import { OptionItem } from 'actions-on-google/response-builder'
import { getDict, Dict } from '../i18n/resolver'

export const name = 'schedules'

export function handler(app: DialogflowApp) {
    const dict: Dict = getDict(app)
    const gameModeArgValue = app.getArgument(GameModeArg.key)
    const requestedGameMode: string = !isNullOrUndefined(gameModeArgValue) ? gameModeArgValue.toString() : GameModeArg.values.all

    return new Splatoon2inkApi().getSchedules()
        .then(schedules => {
            switch (requestedGameMode) {
                case GameModeArg.values.regular:
                    respondWithSchedule(app, dict, getCurrentSchedule(schedules.regular))
                    break
                case GameModeArg.values.ranked:
                    respondWithSchedule(app, dict, getCurrentSchedule(schedules.gachi))
                    break
                case GameModeArg.values.league:
                    respondWithSchedule(app, dict, getCurrentSchedule(schedules.league))
                    break
                case GameModeArg.values.all:
                default:
                    respondWithoutSpecificSchedule(app, dict, schedules)
            }
        })
        .catch(error => {
            console.error(error)
            app.tell(dict.global_error_default)
        })
}

// Reponder

function respondWithSchedule(app: DialogflowApp, dict: Dict, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        app.ask(app.buildRichResponse()
            .addSimpleResponse({
                speech: dict.a_sched_000_s(config.splatoonInk.baseUrl),
                displayText: dict.a_sched_000_t
            })
            .addSuggestionLink('Splatoon.ink', config.splatoonInk.baseUrl))
        return
    }
    const gameMode = dict.api_sched_mode(schedule.game_mode.key, schedule.game_mode.name)
    const gameRule = dict.api_sched_rule(schedule.rule.key, schedule.rule.name)
    return app.askWithList({
            speech: dict.a_sched_002_s(
                gameRule,
                gameMode,
                dict.api_grizz_stage(schedule.stage_a.id, schedule.stage_a.name),
                dict.api_sched_stage(schedule.stage_b.id, schedule.stage_b.name)),
            displayText: dict.a_sched_002_t(
                gameRule,
                gameMode)
        },
        app.buildList(dict.a_sched_003(gameMode))
            .addItems([
                buildStageOptionItem(app, dict, schedule.stage_a, schedule.rule),
                buildStageOptionItem(app, dict, schedule.stage_b, schedule.rule)
            ]))
}

function respondWithoutSpecificSchedule(app: DialogflowApp, dict: Dict, schedules: Schedules) {
    const currentSchedules: Schedule[] = [schedules.regular, schedules.gachi, schedules.league]
        .map(schedules => getCurrentSchedule(schedules))
        .filter(schedule => schedule != null) as Schedule[]
    
    app.askWithCarousel({
            speech: buildOverviewSpeech(dict, currentSchedules),
            displayText: dict.a_sched_004
        }, 
        app.buildCarousel()
            .addItems(currentSchedules.reduce((arr: OptionItem[], schedule) => {
                arr.push(
                    buildStageOptionItem(app, dict, schedule.stage_a, schedule.rule, schedule.game_mode),
                    buildStageOptionItem(app, dict, schedule.stage_b, schedule.rule, schedule.game_mode)
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
        const mode = dict.api_sched_mode(schedule.game_mode.key, schedule.game_mode.name)
        const stage1 = dict.api_sched_stage(schedule.stage_a.id, schedule.stage_a.name)
        const stage2 = dict.api_sched_stage(schedule.stage_b.id, schedule.stage_b.name)
        output += dict.a_sched_005_middle(mode, stage1, stage2)
    })
    output += dict.a_sched_005_end
    return output
}

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

// Helper

function getCurrentSchedule(schedules: [Schedule]): Schedule | null {
    if (isNullOrUndefined(schedules) || schedules.length === 0) return null
    const sortedSchedules = schedules.sort((a, b) => {
        if (a.start_time === b.start_time) return 0;
        return a.start_time > b.start_time ? 1 : -1
    })
    return sortedSchedules[0]
}