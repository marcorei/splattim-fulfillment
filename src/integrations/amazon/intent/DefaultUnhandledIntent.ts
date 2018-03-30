import * as Alexa from 'alexa-sdk'
import { randomEntry } from '../../../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'Unhandled'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    const entry = randomEntry([
        helper.dict.s_unknown_001,
        helper.dict.s_unknown_000
    ])
    return helper.speakRplcEmit(entry)
}