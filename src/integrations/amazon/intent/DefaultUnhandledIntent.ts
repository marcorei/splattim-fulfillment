import { randomEntry } from '../../../util/utils'
import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { CanHandleHelper, HandlerHelper } from '../util/HandlerHelper'

// TODO check if Unhandled is still a thing in v2.
// Or if some error handler is responsible for that.

// Also:
// Test Fallback Intent!

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('Unhandled') ||
            helper.isIntent('AMAZON.FallbackIntent')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        const entry = randomEntry([
            helper.dict.s_unknown_001,
            helper.dict.s_unknown_000
        ])
        return helper.speakRplcEmit(entry)
    })
}