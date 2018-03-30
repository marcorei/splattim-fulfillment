import { Request, Response } from 'express'
import { I18NDialogflowApp } from './I18NDialogflowApp'

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

interface Action {
    name: string,
    handler: (app: I18NDialogflowApp) => void
}

export function createDialogflowApp(request: Request, response: Response) {
    const app = new I18NDialogflowApp({ request, response })
    const actions: Action[] = [
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

    app.handleRequest(actions.reduce(
            (map, action) => map.set(action.name, action.handler), 
            new Map<string, Action['handler']>()))
}
  
