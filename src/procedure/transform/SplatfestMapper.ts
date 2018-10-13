import { FestivalTranslation } from '../../i18n/ContentDict'
import { ResultV1, ResultV2, Result, SummaryV1, SummaryV2, RatesV2, RatesV1 } from '../../splatoon2ink/model/Splatfest'
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

interface SummaryArrPart {
    s: number
    n: string
}

type SummaryArr = [SummaryArrPart, SummaryArrPart, SummaryArrPart]

interface RatesArrPart {
    a: number
    b: number
    n: string
}

type RatesArr = [RatesArrPart, RatesArrPart, RatesArrPart]

function getSummaryArrV2(summary: SummaryV2, dict: Dict) : SummaryArr {
    return [
        { s: summary.vote, n: dict.a_splres_002_votes },
        { s: summary.challenge, n: dict.a_splres_002_v2_challenge },
        { s: summary.regular, n: dict.a_splres_002_v2_regular }
    ]
}

function getSummaryArrV1(summary: SummaryV1, dict: Dict) : SummaryArr {
    return [
        { s: summary.vote, n: dict.a_splres_002_votes },
        { s: summary.solo, n: dict.a_splres_002_solo },
        { s: summary.team, n: dict.a_splres_002_team }
    ]
}

function getRatesArrV2(rates: RatesV2, dict: Dict) : RatesArr {
    return [
        {a: rates.vote.alpha, b: rates.vote.bravo, n: dict.a_splres_004_votes},
        {a: rates.challenge.alpha, b: rates.challenge.bravo, n: dict.a_splres_004_v2_challenge},
        {a: rates.regular.alpha, b: rates.regular.bravo, n: dict.a_splres_004_v2_regular}
    ]
}

function getRatesArrV1(rates: RatesV1, dict: Dict) : RatesArr {
    return [
        {a: rates.vote.alpha, b: rates.vote.bravo, n: dict.a_splres_004_votes},
        {a: rates.solo.alpha, b: rates.solo.bravo, n: dict.a_splres_004_solo},
        {a: rates.team.alpha, b: rates.team.bravo, n: dict.a_splres_004_team}
    ]
}

export function resultsToInfo(
    fest: FestivalTranslation, 
    result: Result, 
    dict: Dict, 
    boldTitles: boolean
) : SplafestResultInfo {
    const summary = result.summary
    const nameAlpha = fest.alpha
    const nameBravo = fest.bravo
    const winner = summary.total === 0 ? nameAlpha : nameBravo
    const loser = summary.total === 0 ? nameBravo : nameAlpha

    let summaryArr: SummaryArr
    let ratesArr: RatesArr

    switch (result.festival_version) {
        case 2:
            const resultV2 = result as ResultV2
            summaryArr = getSummaryArrV2(resultV2.summary, dict)
            ratesArr = getRatesArrV2(resultV2.rates, dict)
            break
        case 1:
        default:
            const resultV1 = result as ResultV1
            summaryArr = getSummaryArrV1(resultV1.summary, dict)
            ratesArr = getRatesArrV1(resultV1.rates, dict)
    }

    const part1 = dict.a_splres_000(winner, loser)
    const part2: string = (() => {
        const results = summaryArr
            .reduce((result2, item) => {
                item.s === summary.total ?
                    result2.won.push(item.n) :
                    result2.lost.push(item.n)
                return result2
            }, {
                won: new Array<string>(),
                lost: new Array<string>()
            })

        return results.lost.length === 0 ?
            dict.a_splres_001 :
            dict.a_splres_002(results.won[0], results.won[1], results.lost[0])
    })()

    const rateString = ratesArr
        .map(r => {
            if (boldTitles) {
                return dict.a_splres_004(r.n, r.a, r.b)
            } else {
                return dict.a_splres_004_x(r.n, r.a, r.b)
            }
        })
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
