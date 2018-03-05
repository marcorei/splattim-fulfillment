import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { randomEntry } from '../../../util/utils'

export const name = 'AMAZON.CancelIntent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    this.response.speak(randomEntry([
        dict.s_cancel_000
    ]))
    this.emit(':responseReady')
}