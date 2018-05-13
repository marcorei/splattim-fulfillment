import { HandlerInput, AttributesManager } from 'ask-sdk'
import { isNullOrUndefined } from 'util'

const tempPersistentAttributesKey = '_persistent'
const lastSeenKey = 'lastSeen'

export class AttributeHelper {

    private manager: AttributesManager

    constructor(handler: HandlerInput) {
        this.manager = handler.attributesManager
    }

    /**
     * Updates the last seen value and returns the diff
     */
    updateLastSeen() : Promise<number> {
        return this.loadPersistentAttributesFromSessionOrPersistence()
            .then(attributes => {
                const lastSeenValue = isNullOrUndefined(attributes[lastSeenKey]) ?
                    -1 : attributes[lastSeenKey]
                const now = Date.now()

                // Update session.
                attributes[lastSeenKey] = now
                this.updatePersistentAttributesInSession(attributes)

                // Return the diff or -1 if previously not available.
                if (lastSeenValue < 0) {
                    return -1
                }
                return now - lastSeenValue
            })
    }

    private updatePersistentAttributesInSession(attributes: { [key: string] : any }) {
        const sessionAttributes = this.manager.getSessionAttributes()
        sessionAttributes[tempPersistentAttributesKey] = attributes
        this.manager.setSessionAttributes(sessionAttributes)
    }

    private loadPersistentAttributesFromSessionOrPersistence() : Promise<{ [key: string] : any }>  {
        const sessionAttributes = this.manager.getSessionAttributes()
        if (sessionAttributes[tempPersistentAttributesKey]) {
            return Promise.resolve(sessionAttributes[tempPersistentAttributesKey])
        }
        return this.manager.getPersistentAttributes()
            .then(persistentAttributes => {
                sessionAttributes[tempPersistentAttributesKey] = persistentAttributes
                this.manager.setSessionAttributes(sessionAttributes)
                return persistentAttributes
            })
    }

    savePersistentSessionAttributesToPersistence() : Promise<void> {
        const sessionAttributes = this.manager.getSessionAttributes()
        const persistentAttributes = sessionAttributes[tempPersistentAttributesKey]
        if (!persistentAttributes) {
            return Promise.resolve()
        }
        this.manager.setPersistentAttributes(persistentAttributes)
        return this.manager.savePersistentAttributes()
    }
}