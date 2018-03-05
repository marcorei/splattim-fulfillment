import * as Alexa from 'alexa-sdk'

import * as defaultCancelIntent from './intent/DefaultCancelIntent'
import * as defaultHelpIntent from './intent/DefaultHelpIntent'
import * as defaultStopIntent from './intent/DefaultStopIntent'
import * as defaultUnhandledIntent from './intent/DefaultUnhandledIntent'
import * as defaulWelcomeIntent from './intent/DefaultWelcomeIntent'
import * as meme1Intent from './intent/Meme1Intent'
import * as meme2Intent from './intent/Meme2Intent'
import * as merchandiseIntent from './intent/MerchandiseIntent'
import * as salmonRunIntent from './intent/SalmonRunIntent'

import * as smallTalkAgeIntent from './intent/SmallTalkAgeIntent'
import * as smallTalkHelloIntent from './intent/SmallTalkHelloIntent'
import * as smallTalkHowAreYouIntent from './intent/SmallTalkHowAreYouIntent'
import * as smallTalkInsultingIntent from './intent/SmallTalkInsultingIntent'


interface Intent {
    name: string,
    handler: (this: Alexa.Handler<Alexa.Request>) => void
}

module.exports.splatTim = function(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: any) {
    const alexa = Alexa.handler(event, context)
    alexa.appId = process.env.ALEXA_APP_ID

    const sessionEnded: Intent = {
        name: 'SessionEndedRequest',
        handler: () => {}
    }

    const intents: Intent[] = [
        defaultCancelIntent,
        defaultHelpIntent,
        defaultStopIntent,
        defaultUnhandledIntent,
        defaulWelcomeIntent,
        meme1Intent,
        meme2Intent,
        merchandiseIntent,
        salmonRunIntent,

        smallTalkAgeIntent,
        smallTalkHelloIntent,
        smallTalkHowAreYouIntent,
        smallTalkInsultingIntent,
        sessionEnded
    ]

    alexa.registerHandlers(intents.reduce(
        (map, intent) => { 
            map[intent.name] = intent.handler 
            return map
        },
        {}))
    alexa.execute()
}