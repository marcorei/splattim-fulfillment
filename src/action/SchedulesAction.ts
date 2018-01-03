import { isNullOrUndefined } from 'util'
import { I18NDialogflowApp, Dict } from '../i18n/I18NDialogflowApp';
import { Responses } from 'actions-on-google'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { config } from '../config'
import { Schedules, Schedule } from '../entity/api/Schedules'
import { GameModeArg } from '../entity/dialog/GameModeArg'
import { OptionItem } from 'actions-on-google/response-builder'
import { sortByStartTime, nowInSplatFormat } from '../common/utils'
import { ArgParser } from '../common/dfUtils'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from './mapper/SchedulesMapper'

export const name = 'schedules'

/**
 * Lists the current stages of either one game mode, or all current stages
 * of all game modes.
 * Either as carousel for all modes, or as list for a specific mode.
 * Asks a follow up question about the preferred satge.
 */
export function handler(app: I18NDialogflowApp) {
    const argParser = new ArgParser(app)
    const requestedGameMode = argParser.stringWithDefault(GameModeArg.key, GameModeArg.values.all)
    if (!argParser.isOk()) return argParser.tellAndLog()
    
    return new Splatoon2inkApi().readSchedules()
        .then(schedules => {
            switch (requestedGameMode) {
                case GameModeArg.values.regular:
                    respondWithSchedule(app, currentScheduleFrom(schedules.regular))
                    break
                case GameModeArg.values.ranked:
                    respondWithSchedule(app, currentScheduleFrom(schedules.gachi))
                    break
                case GameModeArg.values.league:
                    respondWithSchedule(app,  currentScheduleFrom(schedules.league))
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

/**
 * Responds by showing two stages of a given schedule in a list.
 */
function respondWithSchedule(app: I18NDialogflowApp, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        return app.tell(app.buildRichResponse()
            .addSimpleResponse({
                speech: app.getDict().a_sched_000_s(config.splatoonInk.baseUrl),
                displayText: app.getDict().a_sched_000_t
            })
            .addSuggestionLink('Splatoon.ink', config.splatoonInk.baseUrl))
    }

    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), app.getDict())

    return app.askWithList({
            speech: app.getDict().a_sched_002_s(
                info.ruleName,
                info.modeName,
                info.stageB.name,
                info.stageB.name),
            displayText: app.getDict().a_sched_002_t(
                info.ruleName,
                info.modeName)
        },
        app.buildList(app.getDict().a_sched_003(info.modeName))
            .addItems([
                buildStageOptionItem(app, info, info.stageA, false),
                buildStageOptionItem(app, info, info.stageB, false)
            ]))
}

/**
 * Reponds by showing all stages of all active schedules in a carousel.
 */
function respondWithoutSpecificSchedule(app: I18NDialogflowApp, schedules: Schedules) {
    const now = nowInSplatFormat()
    const infos: ScheduleInfo[] = [schedules.regular, schedules.gachi, schedules.league]
        .map(schedules => currentScheduleFrom(schedules))
        .filter(schedule => schedule != null)
        .map(schedule => mapScheduleToInfo(schedule!, now, app.getDict()))
    
    return app.askWithCarousel({
            speech: buildSpeechOverview(app.getDict(), infos),
            displayText: app.getDict().a_sched_004
        }, 
        app.buildCarousel()
            .addItems(infos.reduce((arr: OptionItem[], info) => {
                arr.push(
                    buildStageOptionItem(app, info, info.stageA, true),
                    buildStageOptionItem(app, info, info.stageB, true)
                )
                return arr
            }, [])))
}

/**
 * Builds a string containing all stages of the given StageInfos 
 * intended for a spoken overview.
 */
function buildSpeechOverview(dict: Dict, infos: ScheduleInfo[]): string {
    let output = dict.a_sched_005_start
    infos.forEach((info, index, all) => {
        switch (index) {
            case 0: 
                output += ' ' 
                break
            case all.length - 1: 
                output += dict.a_sched_005_connector 
                break
            default: 
                output += ', '
        }
        output += dict.a_sched_005_middle(info.modeName, info.stageA.name, info.stageB.name)
    })
    output += dict.a_sched_005_end
    return output
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(app: I18NDialogflowApp, info: ScheduleInfo, stageInfo: StageInfo, useMode: boolean): Responses.OptionItem {
    const desc = useMode ? 
        `${info.modeName} - ${info.ruleName}` : 
        info.ruleName
    const optionKey = buildOptionKey(stageInfo.name, info.modeName, info.timeDiff)

    return app.buildOptionItem(optionKey, [stageInfo.name])
        .setTitle(stageInfo.name)
        .setDescription(desc)
        .setImage(stageInfo.image, stageInfo.name)
}

function currentScheduleFrom(schedules: [Schedule]): Schedule | null {
    if (isNullOrUndefined(schedules) || schedules.length === 0) return null
    return schedules.sort(sortByStartTime)[0]
}