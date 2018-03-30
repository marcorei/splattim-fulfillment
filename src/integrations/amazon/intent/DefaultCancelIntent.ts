import * as Alexa from 'alexa-sdk'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'AMAZON.CancelIntent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    return helper.speakRplcEmit(helper.dict.s_cancel_000)
}