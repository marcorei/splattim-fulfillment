import { Result, I18NSplatoon2API } from '../../splatoon2ink/I18NSplatoon2Api'
import { gameModeKeyValues } from '../../splatoon2ink/model/Schedules'
import { Schedule } from '../../splatoon2ink/model/Schedules'
import { sortByStartTime } from '../../util/utils'
import { isNullOrUndefined } from 'util';


export class SchedulesAggregator {
    constructor(private lang: string) {}

    scheduleForModeOrAll(gameMode: string) : Promise<Result<Schedule[][]>> {
        return new I18NSplatoon2API(this.lang).readSchedules()
            .then(result => {
                let data: Schedule[][]
                switch (gameMode) {
                    case gameModeKeyValues.regular:
                        data = [result.content.regular]
                        break
                    case gameModeKeyValues.ranked:
                        data = [result.content.gachi]
                        break
                    case gameModeKeyValues.league:
                        data = [result.content.league]
                    default:
                        data = [result.content.regular, result.content.gachi, result.content.league]
                }
                return {
                    content: data,
                    contentDict: result.contentDict
                }
            })
    }

    scheduleForMode(gameMode: string) : Promise<Result<Schedule[]>> {
        return this.scheduleForModeOrAll(gameMode)
            .then(result => {
                if (result.content.length > 1) {
                    throw new Error(`game mode ${gameMode} is not supported`)
                }
                return {
                    contentDict: result.contentDict,
                    content: result.content[0]
                }
            })
    }

    currentSchedulesForModeOrAll(gameMode: string) : Promise<Result<Schedule[]>> {
        return this.scheduleForModeOrAll(gameMode)
            .then(result => {
                return {
                    contentDict: result.contentDict,
                    content: result.content.map(schedules => 
                        schedules.sort(sortByStartTime)[0])
                }
            })
    }

    scheduleForModeAndRule(gameMode: string, gameRule: string) : Promise<Result<Schedule[]>> {
        return new I18NSplatoon2API(this.lang).readSchedules()
            .then(result => {
                return Promise.resolve(result.content)
                    .then(schedules => gameMode == gameModeKeyValues.league ?
                        schedules.league : 
                        schedules.gachi)
                    .then(schedules => schedules
                        .filter(schedule => {
                            return schedule.rule.key === gameRule
                        })
                        .sort(sortByStartTime))
                    .then(schedule => {
                        return {
                            contentDict: result.contentDict,
                            content: schedule 
                        }
                    })
            })
    }

    schedulesWithStage(stageId: number) : Promise<Result<Schedule[]>> {
        return new I18NSplatoon2API(this.lang).readSchedules()
            .then(result => {
                const schedules = [
                    findStageIn(result.content.league, stageId),
                    findStageIn(result.content.gachi, stageId),
                    findStageIn(result.content.regular, stageId)]
                    .filter(schedule => !isNullOrUndefined(schedule))
                    .map(schedule => schedule as Schedule) // not undefined!
                    .sort(sortByStartTime)
                return {
                    contentDict: result.contentDict,
                    content: schedules
                }
            })
    }
}

function findStageIn(schedules: Schedule[], stage: number) : Schedule | undefined {
    return schedules
        .sort(sortByStartTime)
        .find(schedule => parseInt(schedule.stage_a.id) == stage ||
                parseInt(schedule.stage_b.id) == stage)
}