import * as Alexa from 'alexa-sdk'
import { randomEntry } from '../../../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'MemeItsSplatTim'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    const entry = randomEntry([
        helper.dict.s_meme2_000,
        helper.dict.s_meme2_001,
    ])
    return helper.speakRplcEmit(entry)
}