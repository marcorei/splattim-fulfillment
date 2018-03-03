import { Result, I18NSplatoon2API } from '../../splatoon2ink/I18NSplatoon2Api'
import { sortByEndTime } from '../../util/utils'
import { Merchandise } from '../../splatoon2ink/model/Gear'

export class MerchandiseAggregator {
    constructor(private lang: string) {}

    merchandiseSorted() : Promise<Result<Merchandise[]>> {
        return new I18NSplatoon2API(this.lang).readMerchandise()
            .then(result => {
                return Promise.resolve(result.content)
                    .then(merch => merch.merchandises
                        .sort(sortByEndTime))
                    .then(merch => {
                        return {
                            contentDict: result.contentDict,
                            content: merch
                        }
                    })
            })
    }
}