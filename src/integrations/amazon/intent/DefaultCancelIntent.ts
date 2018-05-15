import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { CanHandleHelper, HandlerHelper } from '../util/HandlerHelper'

// Cancel and stop intent.

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('AMAZON.CancelIntent') ||
            helper.isIntent('AMAZON.StopIntent')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        return helper.speakRplcEmit(helper.dict.s_cancel_000)
    })
}