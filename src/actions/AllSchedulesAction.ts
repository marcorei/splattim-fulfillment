import { isNullOrUndefined } from 'util';
import { DialogflowApp } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Schedule, Stage } from '../model/api/Schedules'
import { GameModeArg } from '../model/dialog/GameModeArg'
import { OptionItem } from 'actions-on-google/response-builder'
import { secondsToTime } from '../common/utils'
import { getDict, Dict } from '../i18n/resolver'

export const name = 'all_schedules'

export function handler(app: DialogflowApp) {
    const dict: Dict = getDict(app)
    const gameModeArgValue = app.getArgument(GameModeArg.key) // Required
    if (isNullOrUndefined(gameModeArgValue)) {
        console.error('required parameter is missing: ' + GameModeArg.key)
        app.tell(dict.global_error_missing_param)
        return
    }
    const requestedGameMode = gameModeArgValue.toString()
    
    return new Splatoon2inkApi().getSchedules()
        .then(schedules => {
            switch (requestedGameMode) {
                case GameModeArg.values.regular:
                    repondWithScheduleList(app, dict, schedules.regular)
                    break
                case GameModeArg.values.ranked:
                    repondWithScheduleList(app, dict, schedules.gachi)
                    break
                case GameModeArg.values.league:
                    repondWithScheduleList(app, dict, schedules.league)
                    break
                case GameModeArg.values.all:
                default:
                    app.tell(dict.a_asched_error_too_much)
            }
        })
        .catch(error => {
            console.error(error)
            app.tell(dict.global_error_default)
        })
}

// Responder

function repondWithScheduleList(app: DialogflowApp, dict: Dict, schedules: Schedule[]) {
    if (isNullOrUndefined(schedules) || schedules.length === 0) {
        app.tell(dict.a_asched_error_empty_data)
        return
    }
    const sortedSchedules = schedules.sort((a, b) => {
        if (a.start_time === b.start_time) return 0;
        return a.start_time > b.start_time ? 1 : -1
    })
    const now = Math.round(new Date().getTime() / 1000)
    const mode = dict.api_sched_mode(schedules[0].game_mode.key, schedules[0].game_mode.name)
    app.askWithCarousel(dict.a_asched_000(mode),
        app.buildCarousel()
            .addItems(sortedSchedules.reduce((arr: OptionItem[], schedule) => {
                arr.push(
                    buildStageOptionItem(app, dict, now, schedule.stage_a, schedule),
                    buildStageOptionItem(app, dict, now, schedule.stage_b, schedule)
                )
                return arr
            }, [])))
}

// Item Builder

function buildStageOptionItem(app: DialogflowApp, dict: Dict, now: number, stage: Stage, schedule: Schedule): OptionItem {
    let timeString = now >= schedule.start_time ? 
        dict.a_asched_001_now : 
        dict.a_asched_001_future + secondsToTime(schedule.start_time - now)
    return app.buildOptionItem('STAGE_' + stage.id + '_' + schedule.id)
        .setTitle(stage.name)
        .setDescription(timeString + ' - ' + schedule.rule.name)
        .setImage(config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + stage.image, stage.name)
}