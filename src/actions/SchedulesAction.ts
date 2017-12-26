import { isNullOrUndefined } from 'util';
import { DialogflowApp, Responses } from 'actions-on-google'
import { Schedules, Schedule, Stage } from '../model/Schedules'
import * as httpsPromise from '../common/httpsPromise'
import * as jsonPromise from '../common/jsonPromise'
import { config } from '../config'

export const name = 'schedules'
const argGameModeKey = 'game-mode'
const argGameModeValues = {
    ranked: 'ranked',
    league: 'league',
    regular: 'regular',
    all: 'all'
}

export function handler(app: DialogflowApp) {
    const argGameMode = app.getArgument(argGameModeKey)
    const requestedGameMode: string = !isNullOrUndefined(argGameMode) ? argGameMode.toString() : argGameModeValues.all

    console.log('trying to load url: ' + config.splatoonInk.baseUrl + config.splatoonInk.data.schedules)
    return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.schedules)
        .then(json => jsonPromise.parse(json))
        .then((schedules: Schedules) => {
            switch (requestedGameMode) {
                case argGameModeValues.regular:
                    respondWithSchedule(app, getCurrentSchedule(schedules.regular))
                case argGameModeValues.ranked:
                    respondWithSchedule(app, getCurrentSchedule(schedules.gachi))
                case argGameModeValues.league:
                    respondWithSchedule(app, getCurrentSchedule(schedules.league))
                case argGameModeValues.all:
                default:
                    respondWithoutSpecificSchedule(app, schedules)
            }
        })
        .catch(error => {
            console.error(error)
            app.tell('Sad woomy. I\'ve been splatted!')
        })
}

function getCurrentSchedule(schedules: [Schedule]): Schedule | null {
    if (isNullOrUndefined(schedules) || schedules.length === 0) return null
    const sortedSchedules = schedules.sort((a, b) => {
        if (a.start_time === b.start_time) return 0;
        return a.start_time > b.start_time ? -1 : 1
    })
    return sortedSchedules[0]
}

function respondWithSchedule(app: DialogflowApp, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        app.ask(app.buildRichResponse()
            .addSimpleResponse('I can\'t help you squiddo. But check out this link!')
            .addSuggestionLink('Splatoon.ink', config.splatoonInk.baseUrl))
        return
    }
    const gameMode = schedule.game_mode.name
    const rules = schedule.rule.name
    return app.askWithList(
        'You can play ' + rules + ' in ' + gameMode + ' on these maps: ',
        app.buildList('Active maps for ' + gameMode)
            .addItems([
                buildStageOptionItem(app, schedule.stage_a),
                buildStageOptionItem(app, schedule.stage_b)
            ])
 )
}

function buildStageOptionItem(app: DialogflowApp, stage: Stage): Responses.OptionItem {
    return app.buildOptionItem('STAGE_' + stage.id, [stage.name])
        .setTitle(stage.name)
        .setImage(config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + stage.image, stage.name)
}

function respondWithoutSpecificSchedule(app: DialogflowApp, schedules: Schedules) {
    app.tell('for now please ask for a sepcific mode')
}