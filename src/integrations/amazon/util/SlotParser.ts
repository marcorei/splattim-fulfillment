import { HandlerInput } from 'ask-sdk'
import { Response } from 'ask-sdk-model'
import { AbstractArgParser } from '../../../util/AbstractArgParser'
import { Dict } from '../../../i18n/Dict'
import { isNullOrUndefined } from 'util'

export class SlotParser extends AbstractArgParser {
    constructor(
        private handlerInput: HandlerInput,
        private dict: Dict) {
        super()
    }

    tellAndLog() : Response {
        console.error(new Error('required parameter is missing: ' + this.missingArgKey))
        return this.handlerInput.responseBuilder
            .speak(this.dict.global_error_missing_param)
            .getResponse()
    }

    protected getValue(key: string) : any {
        const slot = this.handlerInput.requestEnvelope.request['intent'].slots[key]
        if (isNullOrUndefined(slot)) {
            return undefined
        }
        const resolutions = slot.resolutions
        if (isNullOrUndefined(resolutions)) {
            return undefined
        }
        const values = resolutions.resolutionsPerAuthority[0].values
        if (isNullOrUndefined(values)) {
            return undefined
        }
        return values[0].value.id
    }
}
