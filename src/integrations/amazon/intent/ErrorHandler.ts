import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { HandlerHelper } from '../util/HandlerHelper'

export function canHandle(input: HandlerInput, error: Error): Promise<boolean> | boolean {
    return true
}
export function handle(input: HandlerInput, error: Error): Promise<Response> | Response {
    return HandlerHelper.get(input).then(helper => {
        return helper.speakRplcEmit(helper.dict.global_error_default)
    })
}