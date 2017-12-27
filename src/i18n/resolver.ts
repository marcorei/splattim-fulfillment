import { DialogflowApp } from 'actions-on-google'
import { dict } from './en'
import { dict as de } from './de'

export type Dict = typeof dict

export function getDict(app: DialogflowApp): Dict {
    const lang = app['lang'] 
    console.log('searching the fitting locale for: ' + lang)
    switch(lang) {
        case 'de': return de
        default: return dict
    }
}