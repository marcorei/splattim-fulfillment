import * as Alexa from 'alexa-sdk'

import * as defaultCancelIntent from './intent/DefaultCancelIntent'
import * as defaultHelpIntent from './intent/DefaultHelpIntent'
import * as defaultStopIntent from './intent/DefaultStopIntent'
import * as defaultUnhandledIntent from './intent/DefaultUnhandledIntent'
import * as defaultSessionEndedRequest from './intent/DefaultSessionEndedRequest'
import * as defaulWelcomeIntent from './intent/DefaultWelcomeIntent'
import * as meme1Intent from './intent/Meme1Intent'
import * as meme2Intent from './intent/Meme2Intent'
import * as memeBooyahIntent from './intent/MemeBooyahIntent'
import * as merchandiseIntent from './intent/MerchandiseIntent'
import * as salmonRunIntent from './intent/SalmonRunIntent'
import * as scheduleCurrentIntent from './intent/ScheduleCurrentIntent'
import * as scheduleForRuleAndModeIntent from './intent/ScheduleForRuleAndModeIntent'
import * as scheduleForStageIntent from './intent/ScheduleForStageIntent'
import * as scheduleUpcomingIntent from './intent/ScheduleUpcomingIntent'
import * as smallTalkAgeIntent from './intent/SmallTalkAgeIntent'
import * as smallTalkHelloIntent from './intent/SmallTalkHelloIntent'
import * as smallTalkHowAreYouIntent from './intent/SmallTalkHowAreYouIntent'
import * as smallTalkInsultingIntent from './intent/SmallTalkInsultingIntent'
import * as splatfestResultIntent from './intent/SplatfestResultIntent'
import * as splatfestUpcomingIntent from './intent/SplatfestUpcomingIntent'

interface Intent {
    name: string,
    handler: (this: Alexa.Handler<Alexa.Request>) => void
}

module.exports.splatTim = function(event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, callback: any) {
    const alexa = Alexa.handler(event, context, callback)
    alexa.appId = process.env.ALEXA_APP_ID
    alexa.dynamoDBTableName = process.env.ALEXA_ATTRIBUTES_TABLE

    const intents: Intent[] = [
        defaultCancelIntent,
        defaultHelpIntent,
        defaultStopIntent,
        defaultUnhandledIntent,
        defaulWelcomeIntent,
        meme1Intent,
        meme2Intent,
        memeBooyahIntent,
        merchandiseIntent,
        salmonRunIntent,
        scheduleCurrentIntent,
        scheduleForRuleAndModeIntent,
        scheduleForStageIntent,
        scheduleUpcomingIntent,
        smallTalkAgeIntent,
        smallTalkHelloIntent,
        smallTalkHowAreYouIntent,
        smallTalkInsultingIntent,
        splatfestResultIntent,
        splatfestUpcomingIntent,
        defaultSessionEndedRequest,
    ]

    alexa.registerHandlers(intents.reduce(
        (map, intent) => { 
            map[intent.name] = intent.handler 
            return map
        },
        {}))
    alexa.execute()
}