import { Locale } from '../splatoon2ink/model/Localization'
import * as sched from '../splatoon2ink/model/Schedules'
import * as gear from '../splatoon2ink/model/Gear'
import * as coop from '../splatoon2ink/model/SalmonRunSchedules'
import * as splatfest from '../splatoon2ink/model/Splatfest'
import { isNullOrUndefined } from 'util'

interface HasName {
    name: string
}

export interface FestivalTranslation {
    alpha: string,
    bravo: string
}

export class ContentDict {
    constructor(private readonly locale: Locale) {}

    mode(i: sched.GameMode): string {
        const t = this.locale.game_modes[i.key] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    rule(i: sched.Rule): string {
        const t = this.locale.rules[i.key] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    schedStage(i: sched.Stage): string {
        const t = this.locale.stages[i.id] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    schedStageId(id: string): string {
        const t = this.locale.stages[id] as HasName
        return isNullOrUndefined(t) ? 'Unknown' : t.name
    }

    gear(i: gear.Gear): string {
        // First search sub collection that may apply.
        // If nothing is found there we'll fall back to search directly in the gear collection.
        if(!isNullOrUndefined(i.kind)) {
            const kinds = this.locale.gear[i.kind]
            if(!isNullOrUndefined(kinds)) {
                const k = kinds[i.id] as HasName
                if(!isNullOrUndefined(k)) {
                    return k.name
                }
            }
        }
        const t = this.locale.gear[i.id] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    brand(i: gear.Brand): string {
        const t = this.locale.brands[i.id] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    skill(i: gear.Skill): string {
        const t = this.locale.skills[i.id] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    coopStage(i: coop.Stage): string {
        const t = this.locale.coop_stages[i.image] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    weapon(i: coop.Weapon): string {
        const t = this.locale.weapons[i.id] as HasName
        return isNullOrUndefined(t) ? i.name : t.name
    }

    festival(i: splatfest.Festival): FestivalTranslation {
        const t = this.locale.festivals[i.festival_id]
        if(!isNullOrUndefined(t)) {
            return {
                alpha: t['names']['alpha_short'],
                bravo: t['names']['bravo_short']
            }
        }
        return {
            alpha: i.names.alpha_short,
            bravo: i.names.bravo_short
        }
    }
}



