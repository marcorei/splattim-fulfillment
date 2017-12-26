import { Request, Response } from 'express'
import { DialogflowApp } from 'actions-on-google'

import * as SchedulesAction from './actions/SchedulesAction'

export function createDialogflowApp(request: Request, response: Response) {
    const dialogflowApp = new DialogflowApp({request, response})

    const actionMap = new Map()
    actionMap.set(SchedulesAction.name, SchedulesAction.handler)
  
    dialogflowApp.handleRequest(actionMap)
}
  
