// import { isNullOrUndefined } from 'util'
// import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
// import { AssistantApp } from 'actions-on-google'

// export const seperator = '_'

// export type OptionMap = Map<string, (app: I18NDialogflowApp, optionKeyParts: string[]) => void>

// export class OptionAction {
//     name: string 
//     //= AssistantApp.apply.prototype.StandardIntents.OPTION
//     private optionMap: OptionMap

//     constructor(app: I18NDialogflowApp, optionMap: OptionMap) {
//         this.optionMap = optionMap
//         this.name = app.StandardIntents.OPTION.toString()
//         console.log('THE NAME OF THE INTENT IS: ' + this.name)
//     }

//     handler(app: I18NDialogflowApp) {
//         const optionKeyParts = app.getSelectedOption().split(seperator)
//         if (optionKeyParts.length < 1) {
//             app.tell(app.getDict().a_opt_000)
//             return
//         }
//         const optionHandler = this.optionMap[optionKeyParts[0]]
//         if (isNullOrUndefined(optionHandler)) {
//             app.tell(app.getDict().a_opt_000)
//             return 
//         }
//         optionHandler(app, optionKeyParts)
//     }
// }