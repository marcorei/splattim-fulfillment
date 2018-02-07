import { isNullOrUndefined } from 'util'
import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
import { Schedule } from '../entity/api/Schedules'
import { GameModeArg } from '../entity/dialog/GameModeArg'
import { OptionItem } from 'actions-on-google/response-builder'
import { sortByStartTime, nowInSplatFormat } from '../common/utils'
import { ArgParser } from '../common/dfUtils'
import { buildOptionKey } from './SchedulesStageOptionAction'
import { ScheduleInfo, StageInfo, mapScheduleToInfo } from './mapper/SchedulesMapper'
import { ContentDict } from '../i18n/ContentDict'
import { I18NSplatoon2API } from '../i18n/I18NSplatoon2Api'

export const name = 'all_schedules'

/**
 * Lists current and future stages for a given game mode as carousel.
 * Asks on which stage the user wants to get splatted.
 */
export function handler(app: I18NDialogflowApp) {
    const argParser = new ArgParser(app)
    const requestedGameMode = argParser.string(GameModeArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()
    
    return new I18NSplatoon2API(app).readSchedules()
        .then(result => {
            switch (requestedGameMode) {
                case GameModeArg.values.regular:
                    repondWithScheduleCarousel(app, result.contentDict, result.content.regular)
                    break
                case GameModeArg.values.ranked:
                    repondWithScheduleCarousel(app, result.contentDict, result.content.gachi)
                    break
                case GameModeArg.values.league:
                    repondWithScheduleCarousel(app, result.contentDict, result.content.league)
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

/**
 * Responds by providing a carousel of stages.
 * The carousel includes all stages while the speech response features only two.
 */
function repondWithScheduleCarousel(app: I18NDialogflowApp, contentDict: ContentDict, schedules: Schedule[]) {
    if (isNullOrUndefined(schedules) || schedules.length < 2) {
        return app.tell(app.getDict().a_asched_error_empty_data)
    }

    const gameModeName = contentDict.mode(schedules[0].game_mode)
    const now = nowInSplatFormat()
    const scheduleInfos: ScheduleInfo[] = schedules
        .sort(sortByStartTime)
        .map(schedule => mapScheduleToInfo(schedule, now, contentDict))

    if (!app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        return app.tell(app.getDict().a_asched_000_a(
            gameModeName,
            scheduleInfos[0].ruleName,
            scheduleInfos[0].stageA.name,
            scheduleInfos[0].stageB.name,
            scheduleInfos[1].ruleName,
            scheduleInfos[1].timeString,
            scheduleInfos[1].stageA.name,
            scheduleInfos[1].stageB.name))
    }

    return app.askWithCarousel({
            speech: app.getDict().a_asched_000_s(
                gameModeName,
                scheduleInfos[0].ruleName,
                scheduleInfos[0].stageA.name,
                scheduleInfos[0].stageB.name,
                scheduleInfos[1].ruleName,
                scheduleInfos[1].timeString,
                scheduleInfos[1].stageA.name,
                scheduleInfos[1].stageB.name),
            displayText: app.getDict().a_asched_000_t(gameModeName)
        },
        app.buildCarousel()
            .addItems(scheduleInfos.reduce((arr: OptionItem[], info) => {
                arr.push(
                    buildStageOptionItem(app, info.stageA, info),
                    buildStageOptionItem(app, info.stageB, info))
                return arr
            }, [])))
}

/**
 * Builds an OptionItem which can trigger a ScheduleStageOption.
 */
function buildStageOptionItem(app: I18NDialogflowApp, stageInfo: StageInfo, info: ScheduleInfo): OptionItem {
    const optionKey = buildOptionKey(stageInfo.name, undefined, info.timeDiff)
    const etaTimeString = info.timeDiff <= 0 ? 
        app.getDict().a_asched_001_now :
        app.getDict().a_asched_001_future + info.timeString

    return app.buildOptionItem(optionKey, stageInfo.name)
        .setTitle(`${stageInfo.name} - ${etaTimeString}`)
        .setDescription(info.ruleName)
        .setImage(stageInfo.image, stageInfo.name)
}
