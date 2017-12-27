import { DialogflowApp } from 'actions-on-google'
import { dict } from './en'
//import { dict as de } from './de'

export type Dict = typeof dict

export function getDict(app: DialogflowApp): Dict {
    const locale = app.getUserLocale();        
    switch(locale) {
        //case 'de-CH':
        //case 'de-AT':
        //case 'de-DE': return de
        default: return dict
    }
}