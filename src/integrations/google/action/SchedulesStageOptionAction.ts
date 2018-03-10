import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { isNullOrUndefined } from 'util'
import { gameModeKeyValues } from '../../../splatoon2ink/model/Schedules'
import { secondsToTime } from '../util/utils'
const seperator = '_'

export const name = 'schedules-option-stage'

export function buildOptionKey(stageName: string, modeKey?: string, timeDiff?: number): string {
    return [
        'STAGE',
        stageName,
        isNullOrUndefined(modeKey) ? 'none' : modeKey,
        isNullOrUndefined(timeDiff) ? 'none' : timeDiff.toString()
    ].join(seperator)
}

/**
 * Replies to a stage selected previously.
 */
export function handler(app: I18NDialogflowApp) {
    const optionKeyParts = app.getSelectedOption().split(seperator)
    if (optionKeyParts.length < 4) {
        return app.tell(app.getDict().o_schedstage_000)
    }
    const stageName = optionKeyParts[1]
    const modeKey = optionKeyParts[2]
    const timeDiffString = optionKeyParts[3]
    
    if (timeDiffString != 'none') {
        const timeDiff = parseInt(timeDiffString)
        if (timeDiff > 0) {
            const timeString = secondsToTime(timeDiff)
            return app.tell(app.getDict().o_schedstage_002(timeString))
        } 
    }

    if (modeKey == gameModeKeyValues.ranked) {
        return app.tell(app.getDict().o_schedstage_001)
    }

    return app.tell(app.getDict().o_schedstage_003(stageName))
}