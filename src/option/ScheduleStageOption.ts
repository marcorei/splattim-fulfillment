// import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
// import { isNullOrUndefined } from 'util'
// import { seperator } from '../action/OptionAction'
// import { gameModeKeyValues } from '../entity/api/Schedules'
// import { secondsToTime } from '../common/utils'

// export const name = 'STAGE'

// export function buildOptionKey(stageName: string, modeKey?: string, timeDiff?: number): string {
//     return [
//         name,
//         stageName,
//         isNullOrUndefined(modeKey) ? 'none' : modeKey,
//         isNullOrUndefined(timeDiff) ? 'none' : timeDiff.toString()
//     ].join(seperator)
// }

// export function handler(app: I18NDialogflowApp, optionKeyParts: string[]) {
//     if (optionKeyParts.length < 4) {
//         return app.tell(app.getDict().o_schedstage_000)
//     }
//     const stageName = optionKeyParts[1]
//     const modeKey = optionKeyParts[2]
//     const timeDiffString = optionKeyParts[3]
    
//     if (timeDiffString != 'none') {
//         const timeDiff = parseInt(timeDiffString)
//         if (timeDiff > 0) {
//             const timeString = secondsToTime(timeDiff)
//             return app.tell(app.getDict().o_schedstage_002(timeString))
//         } 
//     }

//     if (modeKey == gameModeKeyValues.ranked) {
//         return app.tell(app.getDict().o_schedstage_001)
//     }

//     return app.tell(app.getDict().o_schedstage_003(stageName))
// }