import * as Alexa from 'alexa-sdk'
import { Dict } from '../../i18n/Dict'
import { dict } from '../../i18n/en'
import { dict as de } from '../../i18n/de'

function resolveLang(lang: string): Dict {
    switch(lang) {
        case 'de': return de
        default: return dict
    }
}

function cleanLang(lang: string | undefined): string {
    // List of locales:
    // https://developer.amazon.com/docs/custom-skills/develop-skills-in-multiple-languages.html#h2-code-changes
    switch(lang) {
        case 'de-DE': return 'de'
        default: return 'en'
    }
}

export class DictProvider {
    private dict: Dict
    private lang: string

    constructor(private handler: Alexa.Handler<Alexa.Request>) {
        this.lang = cleanLang(this.handler.event.request.locale)
        this.dict = resolveLang(this.lang)
    }

    getLang(): string {
        return this.lang
    }

    getDict(): Dict {
        return this.dict
    }
}

export type Dict = Dict