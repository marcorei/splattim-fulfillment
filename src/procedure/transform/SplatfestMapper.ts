import { FestivalTranslation } from '../../i18n/ContentDict'
import { Result } from '../../splatoon2ink/model/Splatfest'
import { Dict } from '../../i18n/Dict'

export type SplafestResultInfo = {
    alpha: string
    bravo: string
    winner: string
    loser: string
    part1: string
    part2: string
    rates: string
}

export function resultsToInfo(fest: FestivalTranslation, result: Result, dict: Dict) : SplafestResultInfo {
    const summary = result.summary
    const nameAlpha = fest.alpha
    const nameBravo = fest.bravo
    const winner = summary.total === 0 ? nameAlpha : nameBravo
    const loser = summary.total === 0 ? nameBravo : nameAlpha

    const part1 = dict.a_splres_000(winner, loser)
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

    const rates = result.rates
    const rateString = [
        {a: rates.vote.alpha, b: rates.vote.bravo, n: dict.a_splres_004_votes},
        {a: rates.solo.alpha, b: rates.solo.bravo, n: dict.a_splres_004_solo},
        {a: rates.team.alpha, b: rates.team.bravo, n: dict.a_splres_004_team}]
        .map(r => dict.a_splres_004(r.n, r.a, r.b))
        .join('  \n')

    return {
        alpha: nameAlpha,
        bravo: nameBravo,
        winner: winner,
        loser: loser,
        part1: part1,
        part2: part2,
        rates: rateString
    }
}