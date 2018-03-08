import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { AbstractArgParser } from '../../../util/AbstractArgParser'

export class ArgParser extends AbstractArgParser {
    constructor(private app: I18NDialogflowApp) {
        super()
    }

    tellAndLog() {
        console.error(new Error('required parameter is missing: ' + this.missingArgKey))
        this.app.tell(this.app.getDict().global_error_missing_param)
    }

    protected getValue(key: string) : any {
        return this.app.getArgument(key)
    }
}
    