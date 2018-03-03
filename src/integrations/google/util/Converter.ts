import { GameRuleArg } from '../model/GameRuleArg'
import { GameModeArg } from '../model/GameModeArg'
import { RegionArg } from '../model/RegionArg';
import { gameRuleKeyValues, gameModeKeyValues } from '../../../splatoon2ink/model/Schedules'
import { regionKeyValues } from '../../../splatoon2ink/model/Splatfest'

export function gameRuleArgToApi(argValue: string) : string {
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

export function gameModeArgToApi(argValue: string) : string {
    switch (argValue) {
        case GameModeArg.values.regular:
            return gameModeKeyValues.regular
        case GameModeArg.values.ranked:
            return gameModeKeyValues.ranked
        case GameModeArg.values.league:
            return gameModeKeyValues.league
        default:
            return gameModeKeyValues.regular
    }
}

export function regionArgToApi(argValue: string) : string {
    switch (argValue) {
        case RegionArg.values.eu:
            return regionKeyValues.eu
        case RegionArg.values.na:
            return regionKeyValues.na
        case RegionArg.values.jp:
            return regionKeyValues.jp
        default:
            return regionKeyValues.na
    }
}