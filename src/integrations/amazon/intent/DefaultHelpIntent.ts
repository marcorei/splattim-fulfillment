import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { AttributeHelper } from '../util/Attributes'

export const name = 'AMAZON.HelpIntent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    new AttributeHelper(this).updateLastSeen()
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    this.response.speak(dict.s_help_complete)
    this.response.listen(dict.global_reprompt)
    this.emit(':responseReady')
}