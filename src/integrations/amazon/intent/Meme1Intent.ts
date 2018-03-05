import * as Alexa from 'alexa-sdk'
import { DictProvider } from '../DictProvider'
import { randomEntry } from '../../../util/utils'

export const name = 'MemeHeDoesIt'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    this.response.speak(randomEntry([
        dict.s_meme1_000,
        dict.s_meme1_001,
    ]))
    this.response.listen(dict.global_reprompt)
    this.emit(':responseReady')
}