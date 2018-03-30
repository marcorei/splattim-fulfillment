import * as Alexa from 'alexa-sdk'
import { randomEntry } from '../../../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'MemeHeDoesIt'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    const entry = randomEntry([
        helper.dict.s_meme1_000,
        helper.dict.s_meme1_001,
    ])
    return helper.speakRplcEmit(entry)
}