import * as Alexa from 'alexa-sdk'
import { isNullOrUndefined } from 'util'

const lastSeenKey = 'lastSeen'

export class Attributes {
    constructor(private handler: Alexa.Handler<Alexa.Request>) {}

    /**
     * Returns the timestamp (millis) when the user was last seen.
     * -1 if user was never seen.
     */
    getLastSeen() : number {
        const lastSeenValue = this.handler.attributes[lastSeenKey]
        if (isNullOrUndefined(lastSeenValue)) {
            return -1
        }
        return lastSeenValue
    }

    setLastSeen(value: number) {
        this.handler.attributes[lastSeenKey] = value
    }
}

export class AttributeHelper {
    private attrs: Attributes

    constructor(handler: Alexa.Handler<Alexa.Request>) {
        this.attrs = new Attributes(handler)
    }

    /**
     * Updates the last seen value and returns the diff
     */
    updateLastSeen() : number {
        const prevLastSeenValue = this.attrs.getLastSeen()
        const now = Date.now()
        this.attrs.setLastSeen(now)
        if (prevLastSeenValue < 0) {
            return -1
        }
        return now - prevLastSeenValue
    }
}