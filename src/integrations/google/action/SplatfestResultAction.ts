import { I18NDialogflowApp } from '../I18NDialogflowApp'
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
export function handler(app: I18NDialogflowApp) { 
    const argParser = new ArgParser(app)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    const converter = new Converter()
    const regionId = converter.regionToApi(requestedRegion)
    return new SplatfestAggregator(app.getLang()).latestResult(regionId)
        .then(result => respond(app, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}

/**
 * Reponds with a rich response featuring a card and the results.
 */
function respond(app: I18NDialogflowApp, contentDict: ContentDict, tuple: FestivalResultTuple) {
    const dict = app.getDict()
    const translatedNames = contentDict.festival(tuple.festival)
    
    const info = resultsToInfo(translatedNames, tuple.result, dict, true)

    const card = app.buildBasicCard()
        .setTitle(dict.a_splres_003(info.alpha, info.bravo))
        .setSubtitle(dict.a_splres_006(info.winner))
        .setBodyText(info.rates)
        .setImage(getSplatnetResUrl(tuple.festival.images.panel), dict.a_splres_005)

    return app.tell(app.buildRichResponse()
        .addSimpleResponse({
            speech: `${info.part1} ${info.part2}`,
            displayText: info.part1
        })
        .addBasicCard(card))
}