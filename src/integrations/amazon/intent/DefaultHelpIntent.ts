import * as Alexa from 'alexa-sdk'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'AMAZON.HelpIntent'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    return helper.speakListenRplcEmit(
        helper.dict.s_help_complete,
        helper.dict.global_reprompt
    )
}