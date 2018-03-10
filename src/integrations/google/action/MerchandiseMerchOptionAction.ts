import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { isNullOrUndefined } from 'util'
import { secondsToTime } from '..//util/utils'
const seperator = '_'

export const name = 'merchandise-option-merch'

export function buildOptionKey(merchName: string, skillName: string, timeDiff?: number): string {
    return [
        'MERCH',
        merchName,
        skillName,
        isNullOrUndefined(timeDiff) ? 'none' : timeDiff.toString()
    ].join(seperator)
}

/**
 * Replies to a merch option that waa selected previously.
 */
export function handler(app: I18NDialogflowApp) {
    const optionKeyParts = app.getSelectedOption().split(seperator)
    if (optionKeyParts.length < 4) {
        return app.tell(app.getDict().o_merch_000)
    }
    const merchName = optionKeyParts[1]
    const skillName = optionKeyParts[2]
    const timeDiffString = optionKeyParts[3]

    if (timeDiffString != 'none' && Math.random() > 0.5) {
        const timeDiff = parseInt(timeDiffString)
        if (timeDiff > 0) {
            const timeString = secondsToTime(timeDiff)
            return app.tell(app.getDict().o_merch_001(timeString))
        }
    }

    if (Math.random() > 0.5) {
        return app.tell(app.getDict().o_merch_002(skillName))
    }
    
    return app.tell(app.getDict().o_merch_003(merchName))
}