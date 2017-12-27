import { Schedules } from '../model/api/Schedules'
import { SalmonRunSchedules } from '../model/api/SalmonRunSchedules'
import { Inventory } from '../model/api/Gear'
import * as httpsPromise from '../common/httpsPromise'
import * as jsonPromise from '../common/jsonPromise'
import { config } from '../config'

export class Splatoon2inkApi {
    getSchedules(): Promise<Schedules> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.schedules)
            .then(json => jsonPromise.parse<Schedules>(json))
    }

    getSalmonRunSchedules(): Promise<SalmonRunSchedules> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.coopSchedules)
            .then(json => jsonPromise.parse<SalmonRunSchedules>(json))
    }

    getMerchandise(): Promise<Inventory> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.merchandise)
            .then(json => jsonPromise.parse<Inventory>(json))
    }
}