import { Schedules } from '../entity/api/Schedules'
import { SalmonRunSchedules } from '../entity/api/SalmonRunSchedules'
import { Inventory } from '../entity/api/Gear'
import * as httpsPromise from '../common/httpsPromise'
import * as jsonPromise from '../common/jsonPromise'
import { config } from '../config'

export class Splatoon2inkApi {
    readSchedules(): Promise<Schedules> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.schedules)
            .then(json => jsonPromise.parse<Schedules>(json))
    }

    readSalmonRunSchedules(): Promise<SalmonRunSchedules> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.coopSchedules)
            .then(json => jsonPromise.parse<SalmonRunSchedules>(json))
    }

    readMerchandise(): Promise<Inventory> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.merchandise)
            .then(json => jsonPromise.parse<Inventory>(json))
    }
}

export function getSplatnetResUrl(asset: string): string {
    return config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + asset
}