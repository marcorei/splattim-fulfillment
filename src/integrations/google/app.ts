import { dialogflow, DialogflowIntentHandler, Contexts, Parameters, Argument, OmniHandler } from 'actions-on-google'
import { I18NConversation, i18nMiddleware } from './util/I18NConversation'

import * as schedulesCurrentAction from './action/SchedulesCurrentAction'
import * as schedulesUpcomingAction from './action/SchedulesUpcomingAction'
import * as scheduleForRuleAndModeAction from './action/ScheduleForRuleAndModeAction'
import * as schedulesStageOptionAction from './action/SchedulesStageOptionAction'
import * as merchandiseAction from './action/MerchandiseAction'
import * as merchandiseMerchOptionAction from './action/MerchandiseMerchOptionAction'
import * as salmonRunAction from './action/SalmonRunAction'
import * as salmonRunWeaponOptionAction from './action/SalmonRunWeaponOptionAction'
import * as splatfestResultAction from './action/SplatfestResultAction'
import * as splatfestUpcomingAction from './action/SplatfestUpcomingAction'
import * as scheduleForStageAction from './action/ScheduleForStageAction'
import * as welcomeAction from './action/WelcomeAction'
import * as helpAction from './action/HelpAction'
import * as memeBooyahAction from './action/MemeBooyahAction'

export function createApp() : OmniHandler {
    const app = dialogflow<{}, {}, Contexts, I18NConversation>({
        debug: false
    })
    app.middleware(i18nMiddleware)
    
    interface Intent {
        name: string,
        handler: DialogflowIntentHandler<{}, {}, Contexts, I18NConversation, Parameters, Argument>
    }
    const intents: Intent[] = [
        schedulesCurrentAction,
        schedulesUpcomingAction,
        scheduleForRuleAndModeAction,
        schedulesStageOptionAction,
        merchandiseAction,
        merchandiseMerchOptionAction,
        salmonRunAction,
        salmonRunWeaponOptionAction,
        splatfestResultAction,
        splatfestUpcomingAction,
        scheduleForStageAction,
        welcomeAction,
        helpAction,
        memeBooyahAction
    ]
    intents.forEach(intent => app.intent(intent.name, intent.handler))

    return app
}

  