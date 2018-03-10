
export type RuleConvertable = {
    blitz: string,
    rainmaker: string,
    tower: string,
    zones: string,
    turf: string
}

export type ModeConvertable = {
    regular: string,
    ranked: string,
    league: string
}

export type RegionConvertable = {
    eu: string,
    na : string,
    jp: string
} 

export abstract class AbstractConverter {
    abstract ruleToApi(input: string) : string
    abstract modeToApi(input: string) : string
    abstract regionToApi(input: string) : string

    protected rule(input: string, from: RuleConvertable, to: RuleConvertable) : string {
        switch (input) {
            case from.blitz:
                return to.blitz
            case from.rainmaker:
                return to.rainmaker
            case from.tower:
                return to.tower
            case from.zones:
                return to.zones
            case from.turf:
            default: 
                return to.turf
        }
    }

    protected mode(input: string, from: ModeConvertable, to: ModeConvertable) : string {
        switch (input) {
            case from.ranked:
                return to.ranked
            case from.league:
                return to.league
            case from.regular:
            default:
                return to.regular
        }
    }
    
    protected region(input: string, from: RegionConvertable, to: RegionConvertable) : string {
        switch (input) {
            case from.eu:
                return to.eu
            case from.jp:
                return to.jp
            case from.na:
            default:
                return to.na
        }
    }
}