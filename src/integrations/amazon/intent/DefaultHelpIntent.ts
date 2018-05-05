import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { CanHandleHelper, HandlerHelper } from '../util/HandlerHelper'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('AMAZON.HelpIntent')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        return helper.speakListenRplcEmit(
            helper.dict.s_help_complete,
            helper.dict.global_reprompt
        )
    })
}