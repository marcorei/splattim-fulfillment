import { CustomConversation } from '../util/CustomConversation'
import { Splatoon2inkApi } from '../../../splatoon2ink/Splatoon2inkApi'
import { ContentDict } from '../../../i18n/ContentDict'
import { Timeline } from '../../../splatoon2ink/model/Timeline'
import { Splatfests, regionKeyValues as splatfestRegionKeyValues } from '../../../splatoon2ink/model/Splatfest'
import { SalmonRunSchedules } from '../../../splatoon2ink/model/SalmonRunSchedules'
import { randomEntry, wrapWithSpeak } from '../../../util/utils'
import { SoundFx } from '../../../resources/SoundFx'
import { nowInSplatFormat } from '../../../util/utils'
import { mapDetailToInfo as mapSalmonRun } from '../../../procedure/transform/SalmonRunMapper'
import { secondsToTime } from '../util/utils'
import { SplatfestAggregator } from '../../../procedure/aggregate/SplatfestAggregator'

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

    // TODO: 
    // - define what is new in general terms.
    // - Ponder if it is worth to track individual news.
    // - Define strategies for when to announce and repeat certain things.


    // Salmon Run availability.
    // - This should just contain the time and different wording.
    // - "Today's Salmon Run will open in x hours. Todays Salmon Run is still open for x"
    
    // New Salmon Run gear.
    // - I think this is news on the first three days of the month.
    // - Idealy once per user?
    // - "${gear} is this month Salmon run gear."

    // New weapon.
    // - So idealy we would tell each user once?
    // - Save the id of the last annouced weapon per user.
    // - Give this news for up to three days.

    // New Splatfest / or winner.
    // - Blah

    const api = new Splatoon2inkApi()

    Promise.all([
            api.readLocale(conv.lang),
            api.readTimeline(),
            api.readSplatfest(),
            api.readSalmonRunSchedules()
        ])
        .then(results => {
            respond(conv, {
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


    // Woomy at the beginning!

    const soundFx = new SoundFx()
    const sound = randomEntry([
        soundFx.ngyes(),
        soundFx.squeemy()
    ])
    conv.close(wrapWithSpeak(sound))



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
            fest.fest.times.end < now &&
            fest.fest.times.start > upcomingSplatfestTimeThreshold)
    
    if (splatfestResults.length > 0) {
        // TODO compose result string with components
        const splatfestResultStrings = splatfestResults.map(result => {
            const translatedNames = contentDict.festival(result.result.festival, dict.global_name_pearl, dict.global_name_marina)
            const nameAlpha = translatedNames.alpha
            const nameBravo = translatedNames.bravo
            const winner = result.result.result.summary.total === 0 ? nameAlpha : nameBravo
            const loser = result.result.result.summary.total === 0 ? nameBravo : nameAlpha
            const regionString = '' // TODO!
            return dict.a_brief_002(winner, loser, regionString)
        })

        conv.close()
    }

    if (upcomingSplatfests.length > 0) {
        // TODO compose upcoming string with components
        conv.close()
    }


    // Get Timeline news in there!



    // Finally todays Salmon Run times!

    const salmonRunInfo = mapSalmonRun(results.salmon[0], now, dict, contentDict, secondsToTime)
    conv.close(salmonRunInfo.open ? 
        dict.a_brief_000_a(salmonRunInfo.timeString) :
        dict.a_brief_000_b(salmonRunInfo.timeString))
}

type CombinedResults = {
    contentDict: ContentDict,
    timeline: Timeline,
    splatfest: Splatfests,
    salmon: SalmonRunSchedules
}