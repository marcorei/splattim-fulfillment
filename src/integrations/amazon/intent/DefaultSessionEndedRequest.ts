import * as Alexa from 'alexa-sdk'

export const name = 'SessionEndedRequest'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    console.log('session ended. save state.')
    this.emit(':saveState', true)
}