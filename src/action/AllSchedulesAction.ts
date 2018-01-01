import { isNullOrUndefined } from 'util';
import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp';
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Schedule, Stage } from '../entity/api/Schedules'
import { GameModeArg } from '../entity/dialog/GameModeArg'
import { OptionItem } from 'actions-on-google/response-builder'
import { secondsToTime, sortByStartTime } from '../common/utils'

export const name = 'all_schedules'

export function handler(app: I18NDialogflowApp) {
    const gameModeArgValue = app.getArgument(GameModeArg.key) // Required
    if (isNullOrUndefined(gameModeArgValue)) {
        console.error('required parameter is missing: ' + GameModeArg.key)
        app.tell(app.getDict().global_error_missing_param)
        return
    }
    const requestedGameMode = gameModeArgValue.toString()
    
    return new Splatoon2inkApi().getSchedules()
        .then(schedules => {
            switch (requestedGameMode) {
                case GameModeArg.values.regular:
                    repondWithScheduleList(app, schedules.regular)
                    break
                case GameModeArg.values.ranked:
                    repondWithScheduleList(app, schedules.gachi)
                    break
                case GameModeArg.values.league:
                    repondWithScheduleList(app, schedules.league)
                    break
                case GameModeArg.values.all:
                default:
                    app.tell(app.getDict().a_asched_error_too_much)
            }
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

// Responder

function repondWithScheduleList(app: I18NDialogflowApp, schedules: Schedule[]) {
    if (isNullOrUndefined(schedules) || schedules.length === 0) {
        app.tell(app.getDict().a_asched_error_empty_data)
        return
    }
    const sortedSchedules = schedules.sort(sortByStartTime)
    const now = Math.round(new Date().getTime() / 1000)
    const mode = app.getDict().api_sched_mode(sortedSchedules[0].game_mode)
    app.askWithCarousel(app.getDict().a_asched_000(mode),
        app.buildCarousel()
            .addItems(sortedSchedules.reduce((arr: OptionItem[], schedule) => {
                arr.push(
                    buildStageOptionItem(app, now, schedule.stage_a, schedule),
                    buildStageOptionItem(app, now, schedule.stage_b, schedule))
                return arr
            }, [])))
}

// Item Builder

function buildStageOptionItem(app: I18NDialogflowApp, now: number, stage: Stage, schedule: Schedule): OptionItem {
    const ruleName = app.getDict().api_sched_rule(schedule.rule)
    const stageName = app.getDict().api_sched_stage(stage)
    let timeString = now >= schedule.start_time ? 
        app.getDict().a_asched_001_now : 
        app.getDict().a_asched_001_future + secondsToTime(schedule.start_time - now)
    return app.buildOptionItem('STAGE_' + stage.id + '_' + timeString)
        .setTitle(stageName + ' - ' + timeString)
        .setDescription(ruleName)
        .setImage(config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + stage.image, stage.name)
}