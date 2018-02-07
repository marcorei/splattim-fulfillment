import { ContentDict } from './ContentDict'
import { I18NDialogflowApp } from './I18NDialogflowApp'
import { Splatoon2inkApi } from '../data/Splatoon2inkApi'
import { Schedules } from '../entity/api/Schedules'
import { SalmonRunSchedules } from '../entity/api/SalmonRunSchedules'
import { Inventory } from '../entity/api/Gear'
import { Splatfests } from '../entity/api/Splatfest'

export interface Result<T> {
    contentDict: ContentDict
    content: T
}

// This whole file is to be able to load both files in parallel
// while maintaining type-safety.

export class I18NSplatoon2API {
    constructor(private readonly app: I18NDialogflowApp) {}

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
        return new Splatoon2inkApi().readLocale(this.app.getLang())
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

