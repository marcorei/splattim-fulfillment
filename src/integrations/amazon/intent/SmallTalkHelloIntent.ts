import * as Alexa from 'alexa-sdk'
import { randomEntry } from '../../../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'SmallTalkHello'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    const entry = randomEntry([
        helper.dict.s_hello_000,
        helper.dict.s_hello_001
    ])
    return helper.speakListenRplcEmit(entry, helper.dict.global_reprompt)
}