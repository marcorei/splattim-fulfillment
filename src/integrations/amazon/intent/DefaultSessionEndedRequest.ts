import * as Alexa from 'alexa-sdk'

export const name = 'SessionEndedRequest'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    this.emit(':saveState', true)
}