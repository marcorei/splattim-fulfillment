import { HandlerInput } from 'ask-sdk'
import { isNullOrUndefined } from 'util'

const lastSeenKey = 'lastSeen'

export class AttributeHelper {

    constructor(private handler: HandlerInput) {}

    /**
     * Updates the last seen value and returns the diff
     */
    updateLastSeen() : Promise<number> {
        return this.handler.attributesManager.getPersistentAttributes()
            .then(attributes => {
                const lastSeenValue = isNullOrUndefined(attributes[lastSeenKey]) ?
                    -1 : attributes[lastSeenKey]
                const now = Date.now()

                // Update persistence.
                attributes[lastSeenKey] = now
                this.handler.attributesManager.setPersistentAttributes(attributes)

                // But return the diff or -1 if previously not available.
                if (lastSeenValue < 0) {
                    return -1
                }
                return now - lastSeenValue
            })
    }
}