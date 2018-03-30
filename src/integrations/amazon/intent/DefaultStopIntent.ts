import * as Alexa from 'alexa-sdk'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'AMAZON.StopIntent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    const entry = helper.dict.s_cancel_000
    return helper.speakRplcEmit(entry)
}