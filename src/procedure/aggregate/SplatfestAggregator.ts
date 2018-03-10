import { Result, I18NSplatoon2API } from '../../splatoon2ink/I18NSplatoon2Api'
import { isNullOrUndefined } from 'util'
import { Region, Festival, Result as FestivalResult, regionKeyValues } from '../../splatoon2ink/model/Splatfest'

export interface FestivalResultTuple {
    festival: Festival,
    result: FestivalResult
}

export class SplatfestAggregator {
    constructor(private lang: string) {}

    region(regionId: string) : Promise<Result<Region>> {
        return new I18NSplatoon2API(this.lang).readSplatfest()
            .then(result => 
                Promise.resolve(result.content)
                    .then(splatfest => {
                        switch (regionId) {
                            case regionKeyValues.eu:
                                return splatfest.eu
                            case regionKeyValues.na:
                                return splatfest.na
                            case regionKeyValues.jp:
                                return splatfest.jp
                            default: throw new Error('Unknow region')
                        }
                    })
                    .then(region => {
                        if (region.festivals.length === 0) {
                            throw new Error('No splafests found')
                        }
                        return {
                            contentDict: result.contentDict,
                            content: region
                        }
                    }))
    }

    latestResult(regionId: string) : Promise<Result<FestivalResultTuple>> {
        return this.region(regionId)
            .then(result => {
                const resultMap = result.content.results.reduce(
                    (map, result) => map.set(result.festival_id, result), 
                    new Map<number, FestivalResult>())
                const festival = result.content.festivals
                    .sort(sortFestivals)
                    .find(festival => resultMap.has(festival.festival_id))

                if (isNullOrUndefined(festival)) {
                    throw new Error('No festival with result found.')
                }
                return {
                    contentDict: result.contentDict,
                    content: {
                        festival: festival!,
                        result: resultMap.get(festival.festival_id)!
                    }
                }
            })
    }

    latestFestival(regionId: string) : Promise<Result<Festival>> {
        return this.region(regionId)
            .then(result => {
                const sorted = result.content.festivals
                    .sort(sortFestivals)
                return {
                    contentDict: result.contentDict,
                    content: sorted[0]
                }
            })
    }

}

function sortFestivals(a: Festival, b: Festival): number {
    if (a.times.start === b.times.start) return 0
    return a.times.start > b.times.start ? -1 : 1
}