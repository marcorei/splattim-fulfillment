import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { randomEntry } from '../../../util/utils'
import { AttributeHelper } from '../util/Attributes'

export const name = 'AMAZON.CancelIntent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    new AttributeHelper(this).updateLastSeen()
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    this.response.speak(randomEntry([
        dict.s_cancel_000
    ]))
    this.emit(':responseReady')
}