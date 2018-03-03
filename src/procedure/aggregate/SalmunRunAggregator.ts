import { Result, I18NSplatoon2API } from '../../splatoon2ink/I18NSplatoon2Api'
import { sortByStartTime } from '../../util/utils'
import { Detail } from '../../splatoon2ink/model/SalmonRunSchedules'

export class SalmonRunAggregator {
    constructor(private lang: string) {}

    detailsSorted() : Promise<Result<Detail[]>> {
        return new I18NSplatoon2API(this.lang).readSalmonRunSchedules()
            .then(result => {
                return {
                    contentDict: result.contentDict,
                    content: result.content.details.sort(sortByStartTime)
                }
            })
    }
}