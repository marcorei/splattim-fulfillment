// import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
// import { isNullOrUndefined } from 'util'
// import { seperator } from '../action/OptionAction'
// import { secondsToTime } from '../common/utils'

// export const name = 'MERCH'

// export function buildOptionKey(merchName: string, skillName: string, timeDiff?: number): string {
//     return [
//         name,
//         merchName,
//         skillName,
//         isNullOrUndefined(timeDiff) ? 'none' : timeDiff.toString()
//     ].join(seperator)
// }

// export function handler(app: I18NDialogflowApp, optionKeyParts: string[]) {
//     if (optionKeyParts.length < 4) {
//         return app.tell(app.getDict().o_merch_000)
//     }
//     const merchName = optionKeyParts[1]
//     const skillName = optionKeyParts[2]
//     const timeDiffString = optionKeyParts[3]

//     if (timeDiffString != 'none' && Math.random() > 0.5) {
//         const timeDiff = parseInt(timeDiffString)
//         if (timeDiff > 0) {
//             const timeString = secondsToTime(timeDiff)
//             return app.tell(app.getDict().o_merch_001(timeString))
//         }
//     }

//     if (Math.random() > 0.5) {
//         return app.tell(app.getDict().o_merch_002(skillName))
//     }
    
//     return app.tell(app.getDict().o_merch_003(merchName))
// }