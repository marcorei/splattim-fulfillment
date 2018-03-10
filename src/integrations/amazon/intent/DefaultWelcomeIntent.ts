import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { randomEntry } from '../../../util/utils'

export const name = 'LaunchRequest'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    this.response.speak(randomEntry([
        dict.s_welcome_000,
        dict.s_welcome_001,
        dict.s_welcome_002
    ]))
    this.response.listen(dict.global_reprompt)
    this.emit(':responseReady')
}