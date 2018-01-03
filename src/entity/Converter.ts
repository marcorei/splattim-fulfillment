import { GameRuleArg } from './dialog/GameRuleArg'
import { gameRuleKeyValues } from './api/Schedules'

export function gameRuleArgToApi(argValue: string): string {
    switch (argValue) {
        case GameRuleArg.values.blitz:
            return gameRuleKeyValues.blitz
        case GameRuleArg.values.rainmaker:
            return gameRuleKeyValues.rainmaker
        case GameRuleArg.values.tower:
            return gameRuleKeyValues.tower
        case GameRuleArg.values.zones:
            return gameRuleKeyValues.zones
        case GameRuleArg.values.turf:
        default:
            return gameRuleKeyValues.turf
    }
}