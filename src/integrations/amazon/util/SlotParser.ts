import * as Alexa from 'alexa-sdk'
import { AbstractArgParser } from '../../../util/AbstractArgParser'
import { Dict } from '../../../i18n/Dict'

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
        return this.handler.event['intent'].slots[key]
    }
}