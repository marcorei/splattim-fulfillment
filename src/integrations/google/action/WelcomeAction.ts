import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { isNullOrUndefined } from 'util'
import { randomEntry } from '../../../util/utils'

export const name = 'welcome'

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(app: I18NDialogflowApp) {
    const lastSeen = app.getLastSeen()
    const dict = app.getDict()

    if (isNullOrUndefined(lastSeen)) {
        // New User

        // *Woomy* Hi! I'm Splat Tim. Do you want to know about
        // current stages, Salmon Run or merchandise?
        // Duggestion bubbles.

        const text = `${dict.s_welcome_hi_001} ${dict.s_welcome_intro} ${dict.s_welcome_help_long}`
        return app.ask(app.buildRichResponse()
            .addSimpleResponse({
                speech: text,
                displayText: text
            })
            .addSuggestions([
                dict.global_suggest_salmon,
                dict.global_suggest_stages,
                dict.global_suggest_merchandise,
                dict.global_suggest_splatfest
            ]))
    }
    
    const timeDiff = Math.abs(Date.now() - new Date(lastSeen).getTime())
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))

    if (daysDiff < 14) {
        // Recently visited

        // *Woomy* Hi! What do you want to know?
        // *Woomy* Hey! How can I help?

        const hi = randomEntry([
            dict.s_welcome_hi_000,
            dict.s_welcome_hi_001
        ]) 
        const help = randomEntry([
            dict.s_welcome_help_short_000,
            dict.s_welcome_help_short_001
        ])
        const text = `${hi} ${help}`
        return app.ask(app.buildRichResponse()
            .addSimpleResponse({
                speech: text,
                displayText: text
            })
            .addSuggestions([
                dict.global_suggest_help,
                dict.global_suggest_salmon,
                dict.global_suggest_stages,
                dict.global_suggest_merchandise,
                dict.global_suggest_splatfest]
            ))
    } else {
        // repeat help stuff

        // *Woomy* I'm Splat Tim, long time no see! Do you want to know about
        // current stages, Salmon Run or merchandise?

        const text = `${dict.s_welcome_intro} ${dict.s_welcome_returning} ${dict.s_welcome_help_long}`
        return app.ask(app.buildRichResponse()
            .addSimpleResponse({
                speech: text,
                displayText: text
            })
            .addSuggestions([
                dict.global_suggest_salmon,
                dict.global_suggest_stages,
                dict.global_suggest_merchandise,
                dict.global_suggest_splatfest
            ]))
    }
}