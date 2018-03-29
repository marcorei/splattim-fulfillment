import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { randomEntry } from '../../../util/utils'
import { AttributeHelper } from '../util/Attributes'

export const name = 'LaunchRequest'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const lastSeenDiff = new AttributeHelper(this).updateLastSeen()
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    if (lastSeenDiff < 0) {
        // New User

        const text = `${dict.s_welcome_hi_001} ${dict.s_welcome_intro} ${dict.s_welcome_help_long}`
        this.response.speak(text)
        this.response.listen(dict.global_reprompt)
        return this.emit(':responseReady')
    }

    const daysDiff = Math.floor(lastSeenDiff / (1000 * 3600 * 24))

    if (daysDiff < 14) {
        // Recently visited

        const hi = randomEntry([
            dict.s_welcome_hi_000,
            dict.s_welcome_hi_001
        ]) 
        const help = randomEntry([
            dict.s_welcome_help_short_000,
            dict.s_welcome_help_short_001
        ])
        const text = `${hi} ${help}`
        this.response.speak(text)
        this.response.listen(dict.global_reprompt)
        return this.emit(':responseReady')
    } else {
        // repeat help stuff

        const text = `${dict.s_welcome_intro} ${dict.s_welcome_returning} ${dict.s_welcome_help_long}`
        this.response.speak(text)
        this.response.listen(dict.global_reprompt)
        return this.emit(':responseReady')
    }
}