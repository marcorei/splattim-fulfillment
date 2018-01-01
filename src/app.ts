import { Request, Response } from 'express'
import { I18NDialogflowApp } from './i18n/I18NDialogflowApp'

import { OptionAction } from './action/OptionAction'
import * as allSchedulesAction from './action/AllSchedulesAction'
import * as etaForRuleAction from './action/EtaForRuleAction'
import * as merchandiseAction from './action/MerchandiseAction'
import * as salmonRunAction from './action/SalmonRunAction'
import * as schedulesAction from './action/SchedulesAction'

interface Option {
    name: string,
    handler: (app: I18NDialogflowApp, optionKeyParts: string[]) => void
}

interface Action {
    name: string,
    handler: (app: I18NDialogflowApp) => void
}

export function createDialogflowApp(request: Request, response: Response) {
    const options: Option[] = [

    ]

    const optionsAction = new OptionAction(options.reduce(
        (map, option) => map.set(option.name, option.handler),
        new Map<string, Option['handler']>()))

    const actions: Action[] = [
        allSchedulesAction,
        etaForRuleAction,
        merchandiseAction,
        salmonRunAction,
        schedulesAction,
        optionsAction
    ]

    new I18NDialogflowApp({ request, response })
        .handleRequest(actions.reduce(
            (map, action) => map.set(action.name, action.handler), 
            new Map<string, Action['handler']>()))
}
  
