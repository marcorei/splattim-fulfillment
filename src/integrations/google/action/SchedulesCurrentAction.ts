import { isNullOrUndefined } from 'util'
import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { Responses } from 'actions-on-google'
import { config } from '../../../config'
import { Schedule } from '../../../splatoon2ink/model/Schedules'
import { GameModeArg } from '../model/GameModeArg'
import { OptionItem } from 'actions-on-google/response-builder'
import { nowInSplatFormat } from '../../../util/utils'
import { ArgParser } from '../util/ArgParser'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ScheduleInfo, StageInfo, mapScheduleToInfo, buildCurrentStageSpeechOverview } from '../../../procedure/transform/SchedulesMapper'
import { ContentDict } from '../../../i18n/ContentDict'
import { SchedulesAggregator } from '../../../procedure/aggregate/SchedulesAggregator'
import { Converter } from '../util/Converter'
import { secondsToTime } from '../util/utils'

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

    var modeKey: string
    if (requestedGameMode == GameModeArg.values.all) {
        modeKey = GameModeArg.values.all
    } else {
        const converter = new Converter()
        modeKey = converter.modeToApi(requestedGameMode)
    }
    return new SchedulesAggregator(app.getLang()).currentSchedulesForModeOrAll(modeKey)
        .then(result => {
            if (result.content.length > 1) {
                return respondWithoutSpecificSchedule(app, result.contentDict, result.content)
            }
            return respondWithSchedule(app, result.contentDict, result.content[0])
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

/**
 * Responds by showing two stages of a given schedule in a list.
 */
function respondWithSchedule(app: I18NDialogflowApp, contentDict: ContentDict, schedule: Schedule | null) {
    if (isNullOrUndefined(schedule)) {
        return app.tell(app.buildRichResponse()
            .addSimpleResponse({
                speech: app.getDict().a_sched_000_s(config.splatoonInk.baseUrl),
                displayText: app.getDict().a_sched_000_t
            })
            .addSuggestionLink('Splatoon.ink', config.splatoonInk.baseUrl))
    }

    const info = mapScheduleToInfo(schedule, nowInSplatFormat(), contentDict, secondsToTime)

    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(app.getDict().a_sched_002_a(
            info.ruleName,
            info.modeName,
            info.stageA.name,
            info.stageB.name))
    }

    return app.askWithList({
            speech: app.getDict().a_sched_002_s(
                info.ruleName,
                info.modeName,
                info.stageA.name,
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
function respondWithoutSpecificSchedule(app: I18NDialogflowApp, contentDict: ContentDict, schedules: Schedule[]) {
    const now = nowInSplatFormat()
    const infos: ScheduleInfo[] = schedules
        .filter(schedule => schedule != null)
        .map(schedule => mapScheduleToInfo(schedule!, now, contentDict, secondsToTime))
    
    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(buildCurrentStageSpeechOverview(app.getDict(), infos, false))
    }

    return app.askWithCarousel({
            speech: buildCurrentStageSpeechOverview(app.getDict(), infos, true),
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

