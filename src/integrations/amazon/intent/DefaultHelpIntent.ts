import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { randomEntry } from '../../../util/utils'

export const name = 'AMAZON.HelpIntent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    this.response.speak(randomEntry([
        dict.s_help_000,
        dict.s_help_001,
        dict.s_help_002
    ]))
    this.response.listen(dict.global_reprompt)
    this.emit(':responseReady')
}