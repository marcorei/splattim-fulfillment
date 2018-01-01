import { isNullOrUndefined } from 'util'
import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'

export type OptionMap = Map<string, (app: I18NDialogflowApp, optionKeyParts: string[]) => void>

export class OptionAction {
    name: string = I18NDialogflowApp.prototype.StandardIntents.OPTION.toString()
    private optionMap: OptionMap

    constructor(optionMap: OptionMap) {
        this.optionMap = optionMap
    }

    handler(app: I18NDialogflowApp) {
        const optionKeyParts = app.getSelectedOption().split('_')
        if (optionKeyParts.length < 1) {
            app.tell('Unknown option type') // TODO
            return
        }
        const optionHandler = this.optionMap[optionKeyParts[0]]
        if (isNullOrUndefined(optionHandler)) {
            app.tell('Can not handle this option') // TODO
            return 
        }
        optionHandler(app, optionKeyParts)
    }
}