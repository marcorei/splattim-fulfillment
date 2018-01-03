import { Request, Response } from 'express'
import { I18NDialogflowApp } from './i18n/I18NDialogflowApp'

import * as schedulesAction from './action/SchedulesAction'
import * as allSchedulesAction from './action/AllSchedulesAction'
import * as etaForRuleAction from './action/EtaForRuleAction'
import * as schedulesStageOptionAction from './action/SchedulesStageOptionAction'
import * as merchandiseAction from './action/MerchandiseAction'
import * as merchandiseMerchOptionAction from './action/MerchandiseMerchOptionAction'
import * as salmonRunAction from './action/SalmonRunAction'
import * as salmonRunWeaponOptionAction from './action/SalmonRunWeaponOptionAction'

interface Action {
    name: string,
    handler: (app: I18NDialogflowApp) => void
}

export function createDialogflowApp(request: Request, response: Response) {
    const app = new I18NDialogflowApp({ request, response })
    const actions: Action[] = [
        schedulesAction,
        allSchedulesAction,
        etaForRuleAction,
        schedulesStageOptionAction,
        merchandiseAction,
        merchandiseMerchOptionAction,
        salmonRunAction,
        salmonRunWeaponOptionAction
    ]

    app.handleRequest(actions.reduce(
            (map, action) => map.set(action.name, action.handler), 
            new Map<string, Action['handler']>()))
}
  
