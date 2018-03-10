import { ContentDict } from '../i18n/ContentDict'
import { Splatoon2inkApi } from './Splatoon2inkApi'
import { Schedules } from './model/Schedules'
import { SalmonRunSchedules } from './model/SalmonRunSchedules'
import { Inventory } from './model/Gear'
import { Splatfests } from './model/Splatfest'

export interface Result<T> {
    contentDict: ContentDict
    content: T
}

// This whole file is to be able to load both files in parallel
// while maintaining type-safety.

export class I18NSplatoon2API {
    constructor(private readonly lang: string) {}

    readSchedules(): Promise<Result<Schedules>> {
        return this.loadWithDict(new Splatoon2inkApi().readSchedules())
    }

    readSalmonRunSchedules(): Promise<Result<SalmonRunSchedules>> {
        return this.loadWithDict(new Splatoon2inkApi().readSalmonRunSchedules())
    }

    readMerchandise(): Promise<Result<Inventory>> {
        return this.loadWithDict(new Splatoon2inkApi().readMerchandise())
    }

    readSplatfest(): Promise<Result<Splatfests>> {
        return this.loadWithDict(new Splatoon2inkApi().readSplatfest())
    }


    private loadContentDict(): Promise<ContentDict> {
        return new Splatoon2inkApi().readLocale(this.lang)
            .then(locale => new ContentDict(locale))
    }

    private loadWithDict<T>(p: Promise<T>): Promise<Result<T>> {
        return Promise.all([
            this.loadContentDict(),
            p
        ])
        .then(results => {
            return {
                contentDict: results[0] as ContentDict,
                content: results[1] as T
            }
        })
    }
}

