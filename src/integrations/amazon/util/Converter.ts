import { GameRuleSlot } from '../model/GameRuleSlot'
import { GameModeSlot } from '../model/GameModeSlot'
import { RegionSlot } from '../model/RegionSlot'
import { gameRuleKeyValues, gameModeKeyValues } from '../../../splatoon2ink/model/Schedules'
import { regionKeyValues } from '../../../splatoon2ink/model/Splatfest'
import { AbstractConverter } from '../../../util/AbstractConverter'

export class Converter extends AbstractConverter {
    ruleToApi(input: string) : string {
        return this.rule(input, GameRuleSlot.values, gameRuleKeyValues)
    }

    modeToApi(input: string) : string {
        return this.mode(input, GameModeSlot.values, gameModeKeyValues)
    }

    regionToApi(input: string) : string   {
        return this.region(input, RegionSlot.values, regionKeyValues)
    }
}