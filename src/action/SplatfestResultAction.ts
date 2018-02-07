import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
import { getSplatnetResUrl } from '../data/Splatoon2inkApi'
import { ArgParser } from '../common/dfUtils'
import { RegionArg } from '../entity/dialog/RegionArg'
import { Festival, Result } from '../entity/api/Splatfest'
import { isNullOrUndefined } from 'util'
import { I18NSplatoon2API } from '../i18n/I18NSplatoon2Api'
import { ContentDict } from '../i18n/ContentDict'

export const name = 'splatfest_result'

interface FestivalResultTuple {
    festival: Festival,
    result: Result
}

/**
 * Tells the result of the last Splatfest.
 */
export function handler(app: I18NDialogflowApp) { 
    const argParser = new ArgParser(app)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()
    
    return new I18NSplatoon2API(app).readSplatfest()
        .then(result => {
            return Promise.resolve(result.content)
                .then(splatfest => {
                    switch (requestedRegion) {
                        case RegionArg.values.eu:
                            return splatfest.eu
                        case RegionArg.values.na:
                            return splatfest.na
                        case RegionArg.values.jp:
                            return splatfest.jp
                        default: throw new Error('Unknow region')
                    }
                })
                .then(region => {
                    const resultMap = region.results.reduce(
                        (map, result) => map.set(result.festival_id, result), 
                        new Map<number, Result>())
        
                    const festival = region.festivals
                        .sort((a, b) => {
                            if (a.times.result === b.times.result) return 0
                            return a.times.result > b.times.result ? -1 : 1
                        })
                        .find(festival => {
                            return resultMap.has(festival.festival_id)
                        })
        
                    if (isNullOrUndefined(festival)) {
                        throw new Error('No festival with result found.')
                    }
                    return {
                        festival: festival!,
                        result: resultMap.get(festival.festival_id)!
                    }
                })
                .then(tuple => respond(app, result.contentDict, tuple))
        })
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