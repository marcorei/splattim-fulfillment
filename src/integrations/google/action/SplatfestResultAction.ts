import { SimpleResponse, RichResponse, BasicCard } from 'actions-on-google'
import { CustomConversation } from '../util/CustomConversation'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { ArgParser } from '../util/ArgParser'
import { RegionArg } from '../model/RegionArg'
import { ContentDict } from '../../../i18n/ContentDict'
import { SplatfestAggregator, FestivalResultTuple } from '../../../procedure/aggregate/SplatfestAggregator'
import { Converter } from '../util/Converter'
import { resultsToInfo } from '../../../procedure/transform/SplatfestMapper'

export const name = 'splatfest_result'

/**
 * Tells the result of the last Splatfest.
 */
export function handler(conv: CustomConversation) { 
    const argParser = new ArgParser(conv)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    const converter = new Converter()
    const regionId = converter.regionToApi(requestedRegion)
    return new SplatfestAggregator(conv.lang).latestResult(regionId)
        .then(result => respond(conv, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            return conv.close(conv.dict.global_error_default)
        })
}

/**
 * Reponds with a rich response featuring a card and the results.
 */
function respond(conv: CustomConversation, contentDict: ContentDict, tuple: FestivalResultTuple) {
    const dict = conv.dict
    const translatedNames = contentDict.festival(tuple.festival)
    
    const info = resultsToInfo(translatedNames, tuple.result, dict, true)

    return conv.ask(new RichResponse()
        .add(new SimpleResponse({
            speech: `${info.part1} ${info.part2}`,
            text: info.part1
        }))
        .add(new BasicCard({
            title: dict.a_splres_003(info.alpha, info.bravo),
            subtitle: dict.a_splres_006(info.winner),
            text: info.rates,
            image: {
                url: getSplatnetResUrl(tuple.festival.images.panel),
                accessibilityText: dict.a_splres_005
            }
        })))
}