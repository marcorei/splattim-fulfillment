import { isNullOrUndefined } from 'util'
import { I18NDialogflowApp } from "../i18n/I18NDialogflowApp"

export class ArgParser {
    private app: I18NDialogflowApp
    private missingArgKey: string

    constructor(app: I18NDialogflowApp) {
        this.app = app
    }

    int(key: string): number {
        if (!this.isOk()) return -1
        const arg = this.app.getArgument(key)
        if (isNullOrUndefined(arg)) {
            this.missingArgKey = key
            return -1
        }
        return parseInt(arg.toString())
    }

    string(key: string): string {
        if (!this.isOk()) return ''
        const arg = this.app.getArgument(key)
        if (isNullOrUndefined(arg)) {
            this.missingArgKey = key
            return ''
        }
        return arg.toString()
    }

    stringWithDefault(key: string, defaultValue: string): string {
        if (!this.isOk()) return ''
        const arg = this.app.getArgument(key)
        if (isNullOrUndefined(arg)) {
            return defaultValue
        }
        return arg.toString()
    }

    isOk(): boolean {
        return isNullOrUndefined(this.missingArgKey)
    }

    tellAndLog() {
        console.error(new Error('required parameter is missing: ' + this.missingArgKey))
        this.app.tell(this.app.getDict().global_error_missing_param)
    }
}
    