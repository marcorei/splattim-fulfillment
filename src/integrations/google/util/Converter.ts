import { GameRuleArg } from '../model/GameRuleArg'
import { GameModeArg } from '../model/GameModeArg'
import { RegionArg } from '../model/RegionArg'
import { gameRuleKeyValues, gameModeKeyValues } from '../../../splatoon2ink/model/Schedules'
import { regionKeyValues } from '../../../splatoon2ink/model/Splatfest'
import { AbstractConverter } from '../../../util/AbstractConverter'

export class Converter extends AbstractConverter {
    ruleToApi(input: string) : string {
        return this.rule(input, GameRuleArg.values, gameRuleKeyValues)
    }

    modeToApi(input: string) : string {
        return this.mode(input, GameModeArg.values, gameModeKeyValues)
    }

    regionToApi(input: string) : string   {
        return this.region(input, RegionArg.values, regionKeyValues)
    }
}
