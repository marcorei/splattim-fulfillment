import { DialogflowApp, DialogflowAppOptions } from "actions-on-google"
import { Dict } from '../../i18n/Dict'
import { dict } from '../../i18n/en'
import { dict as de } from '../../i18n/de'

function resolveLang(lang: string): Dict {
    switch(lang) {
        case 'de': return de
        default: return dict
    }
}

function cleanLang(lang: string): string {
    switch(lang) {
        case 'de': return 'de'
        default: return 'en'
    }
}

export class I18NDialogflowApp extends DialogflowApp {
    private dict: Dict
    private lang: string

    constructor(options: DialogflowAppOptions) {
        super(options)
        this.lang = cleanLang(options.request.body['lang'])
        this.dict = resolveLang(this.lang)
    }

    getLang(): string {
        return this.lang
    }

    getDict(): Dict {
        return this.dict
    }
}
