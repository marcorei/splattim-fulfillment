import { SimpleResponse, RichResponse, BasicCard } from 'actions-on-google'
import { CustomConversation } from '../util/CustomConversation'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { ArgParser } from '../util/ArgParser'
import { RegionArg } from '../model/RegionArg'
import { Festival } from '../../../splatoon2ink/model/Splatfest'
import { nowInSplatFormat } from '../../../util/utils'
import { secondsToTime } from '../util/utils'
import { ContentDict } from '../../../i18n/ContentDict'
import { Converter } from '../util/Converter'
import { SplatfestAggregator } from '../../../procedure/aggregate/SplatfestAggregator'

export const names = ['Request - Splatfest Upcoming']

/**
 * Tells if there is an active Splatfest or an upcoming on
 * annouced recently.
 */
export function handler(conv: CustomConversation) {
    const argParser = new ArgParser(conv)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()
    
    const converter = new Converter()
    const regionId = converter.regionToApi(requestedRegion)
    return new SplatfestAggregator(conv.lang).latestFestival(regionId)
        .then(result => respond(conv, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

function respond(conv: CustomConversation, contentDict: ContentDict, fest: Festival) {
    const dict = conv.dict
    const now = nowInSplatFormat()
    const translated = contentDict.festival(fest)

    if (now >= fest.times.end) {
        return conv.close(dict.a_splup_000)
    }

    if (now >= fest.times.start) {
        const timeTillEnd = secondsToTime(fest.times.end - now)
        return conv.close(new RichResponse()
            .add(new SimpleResponse({
                speech: dict.a_splup_003_s(timeTillEnd, translated.alpha, translated.bravo),
                text: dict.a_splup_003_t(timeTillEnd)
            }))
            .add(new BasicCard({
                title: dict.a_splup_001(translated.alpha, translated.bravo),
                subtitle: dict.a_splup_003_b(timeTillEnd),
                image: {
                    url: getSplatnetResUrl(fest.images.panel),
                    accessibilityText: dict.a_splup_002
                }
            })))
    }

    const timeTillStart = secondsToTime(fest.times.start - now)
    return conv.close(new RichResponse()
        .add(new SimpleResponse({
            speech: dict.a_splup_004_s(timeTillStart, translated.alpha, translated.bravo),
            text: dict.a_splup_004_t(timeTillStart)
        }))
        .add(new BasicCard({
            title: dict.a_splup_001(translated.alpha, translated.bravo),
            subtitle: dict.a_splup_004_b(timeTillStart),
            image: {
                url: getSplatnetResUrl(fest.images.panel),
                accessibilityText: dict.a_splup_002
            }
        })))
}
