import { Request, Response } from 'express'
import { DialogflowApp } from 'actions-on-google'
import { getDict } from './i18n/resolver'

import * as AllSchedulesAction from './actions/AllSchedulesAction'
import * as EtaForRuleAction from './actions/EtaForRuleAction'
import * as MerchandiseAction from './actions/MerchandiseAction'
import * as SalmonRunAction from './actions/SalmonRunAction'
import * as SchedulesAction from './actions/SchedulesAction'

export function createDialogflowApp(request: Request, response: Response) {
    const dialogflowApp = new DialogflowApp({request, response})

    interface Action {
        name: string,
        handler: (app: DialogflowApp) => void
    }
    const actions: Action[] = [
        AllSchedulesAction,
        EtaForRuleAction,
        MerchandiseAction,
        SalmonRunAction,
        SchedulesAction
    ]

    const actionMap = new Map()
    actions.forEach(action => actionMap.set(action.name, action.handler))
    dialogflowApp.handleRequest(actionMap)
}
  
