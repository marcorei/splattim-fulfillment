import { SkillBuilders, Skill } from 'ask-sdk-core'
import { RequestEnvelope } from 'ask-sdk-model'
import { DynamoDbPersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter'

import * as defaultCancelIntent from './intent/DefaultCancelIntent'
import * as defaultHelpIntent from './intent/DefaultHelpIntent'
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

let skill: Skill | undefined

module.exports.splatTim = function(event: RequestEnvelope, context: any, callback: any) {
    if (!skill) {
        if (!process.env.ALEXA_APP_ID || !process.env.ALEXA_ATTRIBUTES_TABLE) {
            throw new Error('Lambda env not configured properly')
        }

        skill = SkillBuilders.custom()
            .withSkillId(process.env.ALEXA_APP_ID)
            .withPersistenceAdapter(new DynamoDbPersistenceAdapter({
                tableName: process.env.ALEXA_ATTRIBUTES_TABLE
            }))
            .addRequestHandlers(
                defaultCancelIntent,
                defaultHelpIntent,
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
                defaultUnhandledIntent,
            )
            .addErrorHandlers()
            .create()
    }

    return skill.invoke(event, context)
}