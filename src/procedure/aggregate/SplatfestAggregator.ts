import { Result, I18NSplatoon2API } from '../../splatoon2ink/I18NSplatoon2Api'
import { isNullOrUndefined } from 'util'
import { Region, Festival, Result as FestivalResult, regionKeyValues, Splatfests } from '../../splatoon2ink/model/Splatfest'

export interface FestivalResultTuple {
    festival: Festival,
    result: FestivalResult
}

export class SplatfestAggregator {
    static filterRegion(regionId: string, splatfest: Splatfests) : Region {
        let region: Region
        switch (regionId) {
            case regionKeyValues.eu:
                region = splatfest.eu
                break
            case regionKeyValues.na:
                region = splatfest.na
                break
            case regionKeyValues.jp:
                region = splatfest.jp
                break
            default: throw new Error('Unknow region')
        }
        if (region.festivals.length === 0) {
            throw new Error('No splafests found')
        }
        return region
    }

    static filterLatestResult(region: Region) : FestivalResultTuple {
        const resultMap = region.results.reduce(
            (map, result) => map.set(result.festival_id, result), 
            new Map<number, FestivalResult>())
        const festival = region.festivals
            .sort(sortFestivals)
            .find(festival => resultMap.has(festival.festival_id))

        if (isNullOrUndefined(festival)) {
            throw new Error('No festival with result found.')
        }
        return {
            festival: festival!,
            result: resultMap.get(festival.festival_id)!
        }
    }

    static filterLatestFestival(region: Region) : Festival {
        return region.festivals.sort(sortFestivals)[0]
    }

    constructor(private lang: string) {}

    region(regionId: string) : Promise<Result<Region>> {
        return new I18NSplatoon2API(this.lang).readSplatfest()
            .then(result => 
                Promise.resolve(result.content)
                    .then(splatfest => SplatfestAggregator.filterRegion(regionId, splatfest))
                    .then(region => { return {
                        contentDict: result.contentDict,
                        content: region
                    }}))
    }

    latestResult(regionId: string) : Promise<Result<FestivalResultTuple>> {
        return this.region(regionId)
            .then(result => { return {
                contentDict: result.contentDict,
                content: SplatfestAggregator.filterLatestResult(result.content)
            }})
    }

    latestFestival(regionId: string) : Promise<Result<Festival>> {
        return this.region(regionId)
            .then(result => { return {
                contentDict: result.contentDict,
                content: SplatfestAggregator.filterLatestFestival(result.content)
            }})
    }
}

function sortFestivals(a: Festival, b: Festival): number {
    if (a.times.start === b.times.start) return 0
    return a.times.start > b.times.start ? -1 : 1
}