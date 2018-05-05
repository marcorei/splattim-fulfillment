import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { CanHandleHelper } from '../util/HandlerHelper'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isType('SessionEndedRequest')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return input.attributesManager.savePersistentAttributes()
        .then(_ => input.responseBuilder.getResponse())
}