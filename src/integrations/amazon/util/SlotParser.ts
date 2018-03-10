import * as Alexa from 'alexa-sdk'
import { AbstractArgParser } from '../../../util/AbstractArgParser'
import { Dict } from '../../../i18n/Dict'
import { isNullOrUndefined } from 'util';

export class SlotParser extends AbstractArgParser {
    constructor(
        private handler: Alexa.Handler<Alexa.Request>,
        private dict: Dict) {
        super()
    }

    tellAndLog() {
        console.error(new Error('required parameter is missing: ' + this.missingArgKey))
        this.handler.response.speak(this.dict.global_error_missing_param)
        this.handler.emit(':responseReady')
    }

    protected getValue(key: string) : any {
        const slot = this.handler.event.request['intent'].slots[key]
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
