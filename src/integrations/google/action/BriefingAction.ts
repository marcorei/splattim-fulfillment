import { CustomConversation } from '../util/CustomConversation'
import { Splatoon2inkApi } from '../../../splatoon2ink/Splatoon2inkApi'
import { ContentDict } from '../../../i18n/ContentDict'
import { Timeline } from '../../../splatoon2ink/model/Timeline'
import { Splatfests, regionKeyValues as splatfestRegionKeyValues } from '../../../splatoon2ink/model/Splatfest'
import { SalmonRunSchedules } from '../../../splatoon2ink/model/SalmonRunSchedules'
import { randomEntry, wrapWithSpeak, sortByStartTime } from '../../../util/utils'
import { SoundFx } from '../../../resources/SoundFx'
import { nowInSplatFormat } from '../../../util/utils'
import { mapDetailToInfo as mapSalmonRun } from '../../../procedure/transform/SalmonRunMapper'
import { secondsToTime } from '../util/utils'
import { SplatfestAggregator } from '../../../procedure/aggregate/SplatfestAggregator'
import { Dict } from '../../../i18n/Dict'

export const names = ['Request - Briefing']

/**
 * Get your daily briefing.
 * Includes todays Salmon Run times.
 * New Salmon Run gear (beginning of the month).
 * News about Splatfest.
 * And new weapons.
 * 
 * And mayber later if I can convince Matt: new stages!
 */
export function handler(conv: CustomConversation) {
    const api = new Splatoon2inkApi()

    return Promise.all([
            api.readLocale(conv.lang),
            api.readTimeline(),
            api.readSplatfest(),
            api.readSalmonRunSchedules()
        ])
        .then(results => {
            return respond(conv, {
                contentDict: new ContentDict(results[0]),
                timeline: results[1],
                splatfest: results[2],
                salmon: results[3]
            })
        })
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

function respond(conv: CustomConversation, results: CombinedResults) {
    const now = nowInSplatFormat()
    const dict = conv.dict
    const contentDict = results.contentDict
    const builder = new SSMLReponseBuilder()



    // Woomy at the beginning!

    const soundFx = new SoundFx()
    const sound = randomEntry([
        soundFx.ngyes(),
        soundFx.squeemy()
    ])
    const welcome = randomEntry([
        dict.a_brief_intro_000,
        dict.a_brief_intro_001,
    ])
    builder.add(`${sound}${welcome}`)




    // Get Splatfest News in there!

    const splatfests = [{
            region: splatfestRegionKeyValues.eu,
            fest: results.splatfest.eu 
        }, {
            region: splatfestRegionKeyValues.na,
            fest: results.splatfest.na
        }, {
            region: splatfestRegionKeyValues.jp,
            fest: results.splatfest.jp
        }]

    // Prepare data for results.
    const splatfestResultTimeThreshold = now + (3 * 24 * 60 * 60)
    const splatfestResultsRegions : { [key: number] : string[] } = {}
    const splatfestResults = splatfests
        .map(fest => { return {
            region: fest.region,
            result: SplatfestAggregator.filterLatestResult(fest.fest)
        }})
        .filter(fest => {
            if (!splatfestResultsRegions[fest.result.festival.festival_id]) {
                splatfestResultsRegions[fest.result.festival.festival_id] = [fest.region]
                return true
            }
            splatfestResultsRegions[fest.result.festival.festival_id].push(fest.region)
            return false
        })
        .filter(fest => fest.result.festival.times.end < splatfestResultTimeThreshold)

    // Prepare data for upcoming fests.
    const upcomingSplatfestTimeThreshold = now - (3 * 24 * 60 * 60)
    const upcomingSplatfestRegions: { [key: number] : string[] } = {}
    const upcomingSplatfests = splatfests
        .map(fest => { return {
            region: fest.region,
            fest: SplatfestAggregator.filterLatestFestival(fest.fest)
        }})
        .filter(fest => {
            if (!upcomingSplatfestRegions[fest.fest.festival_id]) {
                upcomingSplatfestRegions[fest.fest.festival_id] = [fest.region]
                return true
            }
            upcomingSplatfestRegions[fest.fest.festival_id].push(fest.region)
            return false
        })
        .filter(fest => 
            fest.fest.times.end > now &&
            fest.fest.times.start > upcomingSplatfestTimeThreshold)
    
    // Compose string for upcoming splatfests.
    if (upcomingSplatfests.length > 0) {
        // TODO: filter finished splatfest!
        const upcomingSplatfestString = upcomingSplatfests
            .map(fest => upcomingSplatfestRegions[fest.fest.festival_id])
            .reduce((prev, next) => {
                return prev.concat(next)
            }, [])
            .map(region => regionLocalised(dict, region))
        const regionString = concatTogether({
            dict: dict,
            arr: upcomingSplatfestString
        })
        builder.add(dict.a_brief_003(regionString))
    }

    // Compose string for splatfest results.
    if (splatfestResults.length > 0) {
        const splatfestResultStrings = splatfestResults.map(result => {
            const translatedNames = contentDict.festival(result.result.festival, dict.global_name_pearl, dict.global_name_marina)
            const nameAlpha = translatedNames.alpha
            const nameBravo = translatedNames.bravo
            const winner = result.result.result.summary.total === 0 ? nameAlpha : nameBravo
            const loser = result.result.result.summary.total === 0 ? nameBravo : nameAlpha
            const regionString = concatTogether({
                dict: dict,
                arr: upcomingSplatfestRegions[result.result.festival.festival_id]
                    .map(regionId => regionLocalised(dict, regionId)),
            })
            return dict.a_brief_002(winner, loser, regionString)
        })

        let splatfestResultResponse = `${dict.a_brief_001} ${
            concatTogether({
                dict: dict,
                arr: splatfestResultStrings,
                middleSeperator: '.',
                endSeperator: `. ${upper(dict.a_brief_last_connector, true)}`,
                upperFirstAndMid: true
            })
        }!`
        builder.add(splatfestResultResponse)
    }

    


    // Get Timeline news in there!

    // Sheldon got a new weapon
    if (results.timeline.weapon_availability) {
        const freshWeapons = results.timeline.weapon_availability.availabilities
            .map(avail => results.contentDict.weapon(avail.weapon))
        const freshWeaponsString = concatTogether({
            dict: dict,
            arr: freshWeapons
        })
        builder.add(dict.a_brief_004(freshWeaponsString))
    }

    // New Coop gear
    const coopGearThreshold = results.timeline.coop.reward_gear.available_time 
        + (3 * 24 * 60 * 60)
    if (now < coopGearThreshold) {
        const gearName = results.contentDict.gear(results.timeline.coop.reward_gear.gear)
        builder.add(dict.a_brief_005(gearName))
    }



    // Finally todays Salmon Run times!

    const salmonRunInfo = mapSalmonRun(
        results.salmon.details.sort(sortByStartTime)[0], 
        now, dict, contentDict, secondsToTime)
    const salmonRunString = salmonRunInfo.open ? 
        dict.a_brief_000_a(salmonRunInfo.timeString) :
        dict.a_brief_000_b(salmonRunInfo.timeString)
    builder.add(builder.length() > 1 ?
        `${dict.a_brief_finally}${salmonRunString}` :
        salmonRunString)


    conv.close(builder.build())
}

type CombinedResults = {
    contentDict: ContentDict,
    timeline: Timeline,
    splatfest: Splatfests,
    salmon: SalmonRunSchedules
}

function concatTogether(options: { 
        dict: Dict, 
        arr: string[], 
        middleSeperator?: string, 
        endSeperator?: string,
        upperFirstAndMid?: boolean,
        upperLast?: boolean
    }) : string {
    
    let composed: string = ''
    const dict = options.dict
    const middleSeperator = options.middleSeperator ? options.middleSeperator! : ','
    const endSeperator = options.endSeperator ? options.endSeperator! : ` ${dict.a_brief_last_connector}`
    
    options.arr.forEach((element, index) => {
        if (index == 0) {
            composed += upper(element, options.upperFirstAndMid)
        } else if (index == options.arr.length - 1) {
            composed += `${endSeperator} ${upper(element, options.upperFirstAndMid)}`
        } else {
            composed += `${middleSeperator} ${upper(element, options.upperLast)}`
        }
    })
    return composed
}

function upper(input: string, should?: boolean) : string {
    if (should) return input.charAt(0).toUpperCase() + input.slice(1)
    return input
}

function regionLocalised(dict: Dict, regionId: string) : string {
    switch(regionId) {
        case splatfestRegionKeyValues.eu:
            return dict.global_region_eu
        case splatfestRegionKeyValues.na:
            return dict.global_region_na
        case splatfestRegionKeyValues.jp:
            return dict.global_region_jp
        default:
            throw new Error('Unknown Region')
    }
}

class SSMLReponseBuilder {
    private parts: string[] = []

    add(ssml: string) {
        this.parts.push(ssml)
    }

    length() {
        return this.parts.length
    }

    build() : string {
        let combined: string = ''
        this.parts.forEach((element, index) => {
            if (index != 0) {
                combined += '<break time="800ms"/>'
            }
            combined += element
        })
        return wrapWithSpeak(combined)
    }
}