import { isNullOrUndefined } from 'util'

export abstract class AbstractArgParser {
    protected missingArgKey: string

    int(key: string) : number {
        if (!this.isOk()) return -1
        const arg = this.getValue(key)
        if (isNullOrUndefined(arg)) {
            this.missingArgKey = key
            return -1
        }
        return parseInt(arg.toString())
    }

    string(key: string) : string {
        if (!this.isOk()) return ''
        const arg = this.getValue(key)
        if (isNullOrUndefined(arg)) {
            this.missingArgKey = key
            return ''
        }
        return arg.toString()
    }

    stringWithDefault(key: string, defaultValue: string) : string {
        if (!this.isOk()) return ''
        const arg = this.getValue(key)
        if (isNullOrUndefined(arg)) {
            return defaultValue
        }
        return arg.toString()
    }

    isOk() : boolean {
        return isNullOrUndefined(this.missingArgKey)
    }

    abstract tellAndLog() : void

    protected abstract getValue(key: string) : any 
}
    