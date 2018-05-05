import { randomEntry } from '../../../util/utils'
import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { CanHandleHelper, HandlerHelper } from '../util/HandlerHelper'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('SmallTalkInsulting')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        const entry = randomEntry([
            helper.dict.s_insult_000,
            helper.dict.s_insult_001
        ])
        return helper.speakListenRplcEmit(entry, helper.dict.global_reprompt)
    })
}