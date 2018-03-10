import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { randomEntry } from '../../../util/utils'

export const name = 'Unhandled'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    this.response.speak(randomEntry([
        dict.s_unknown_001,
        dict.s_unknown_000
    ]))
    this.response.listen(dict.global_reprompt)
    this.emit(':responseReady')
}