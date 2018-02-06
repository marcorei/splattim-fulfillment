import { DialogflowApp, DialogflowAppOptions } from "actions-on-google";

import { dict } from './en'
import { dict as de } from './de'

function resolveLang(lang: string): Dict {
    switch(lang) {
        case 'de': return de
        default: return dict
    }
}

export type Dict = typeof dict

export class I18NDialogflowApp extends DialogflowApp {
    private dict: Dict
    private lang: string

    constructor(options: DialogflowAppOptions) {
        super(options)
        this.lang = options.request.body['lang']
        this.dict = resolveLang(this.lang)
    }

    getLang(): string {
        return this.lang
    }

    getDict(): Dict {
        return this.dict
    }
}
