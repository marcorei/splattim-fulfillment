import { Schedules } from './model/Schedules'
import { SalmonRunSchedules } from './model/SalmonRunSchedules'
import { Inventory } from './model/Gear'
import { Splatfests } from './model/Splatfest'
import { Timeline } from './model/Timeline'
import { Locale } from './model/Localization'
import * as httpsPromise from '../util/httpsPromise'
import * as jsonPromise from '../util/jsonPromise'
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

    readSplatfest(): Promise<Splatfests> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.splatfest)
            .then(json => jsonPromise.parse<Splatfests>(json))
    }

    readTimeline(): Promise<Timeline> {
        return httpsPromise.loadContent(config.splatoonInk.baseUrl + config.splatoonInk.data.timeline)
            .then(json => jsonPromise.parse<Timeline>(json))
    }

    readLocale(locale: string): Promise<Locale> {
        const url = `${config.splatoonInk.baseUrl}${config.splatoonInk.data.localization}/${locale}.json`
        return httpsPromise.loadContent(url)
            .then(json => jsonPromise.parse<Locale>(json))
    }
}

export function getSplatnetResUrl(asset: string): string {
    return config.splatoonInk.baseUrl + config.splatoonInk.assets.splatnet + asset
}