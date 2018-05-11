import { CustomConversation } from '../util/CustomConversation'
import { AbstractArgParser } from '../../../util/AbstractArgParser'

export class ArgParser extends AbstractArgParser {
    constructor(private conv: CustomConversation) {
        super()
    }

    tellAndLog() {
        console.error(new Error('required parameter is missing: ' + this.missingArgKey))
        this.conv.close(this.conv.dict.global_error_missing_param)
    }

    protected getValue(key: string) : any {
        return this.conv.arguments.get(key)
    }
}
    