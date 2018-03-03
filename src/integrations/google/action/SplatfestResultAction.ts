import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { ArgParser } from '../util/dfUtils'
import { RegionArg } from '../model/RegionArg'
import { ContentDict } from '../../../i18n/ContentDict'
import { SplatfestAggregator, FestivalResultTuple } from '../../../procedure/aggregate/SplatfestAggregator'
import { regionArgToApi } from '../util/Converter'

export const name = 'splatfest_result'


/**
 * Tells the result of the last Splatfest.
 */
export function handler(app: I18NDialogflowApp) { 
    const argParser = new ArgParser(app)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()

    const regionId = regionArgToApi(requestedRegion)
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
    const summary = tuple.result.summary
    const translatedNames = contentDict.festival(tuple.festival)
    const nameAlpha = translatedNames.alpha
    const nameBravo = translatedNames.bravo
    const names = {
        winner: summary.total === 0 ? nameAlpha : nameBravo,
        loser: summary.total === 0 ? nameBravo : nameAlpha,
    }

    const part1 = dict.a_splres_000(names.winner, names.loser)
    const part2: string = (() => {
        const results = [
            { s: summary.vote, n: dict.a_splres_002_votes },
            { s: summary.solo, n: dict.a_splres_002_solo },
            { s: summary.team, n: dict.a_splres_002_team }]
            .reduce((result, item) => {
                item.s === summary.total ?
                    result.won.push(item.n) :
                    result.lost.push(item.n)
                return result
            }, {
                won: new Array<string>(),
                lost: new Array<string>()
            })

        return results.lost.length === 0 ?
            dict.a_splres_001 :
            dict.a_splres_002(results.won[0], results.won[1], results.lost[0])
    })()

    const rates = tuple.result.rates
    const rateString = [
        {a: rates.vote.alpha, b: rates.vote.bravo, n: dict.a_splres_004_votes},
        {a: rates.solo.alpha, b: rates.solo.bravo, n: dict.a_splres_004_solo},
        {a: rates.team.alpha, b: rates.team.bravo, n: dict.a_splres_004_team}]
        .map(r => dict.a_splres_004(r.n, r.a, r.b))
        .join('  \n')

    const card = app.buildBasicCard()
        .setTitle(dict.a_splres_003(nameAlpha, nameBravo))
        .setSubtitle(dict.a_splres_006(names.winner))
        .setBodyText(rateString)
        .setImage(getSplatnetResUrl(tuple.festival.images.panel), dict.a_splres_005)

    return app.tell(app.buildRichResponse()
        .addSimpleResponse({
            speech: `${part1} ${part2}`,
            displayText: part1
        })
        .addBasicCard(card))
}