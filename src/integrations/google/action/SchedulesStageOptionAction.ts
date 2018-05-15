import { OptionArgument, Parameters } from 'actions-on-google'
import { CustomConversation } from '../util/CustomConversation'
import { isNullOrUndefined } from 'util'
import { gameModeKeyValues } from '../../../splatoon2ink/model/Schedules'
import { secondsToTime } from '../util/utils'
const seperator = '_'

export const names = [
    'Option - Schedule for Rule and Mode',
    'Option - Schedule for Stage',
    'Option - Schedule Current',
    'Option - Schedules Upcoming',
]

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
export function handler(conv: CustomConversation, params: Parameters, optionKey: OptionArgument) {
    const optionKeyParts = optionKey.split(seperator)
    if (optionKeyParts.length < 4) {
        return conv.close(conv.dict.o_schedstage_000)
    }
    const stageName = optionKeyParts[1]
    const modeKey = optionKeyParts[2]
    const timeDiffString = optionKeyParts[3]
    
    if (timeDiffString != 'none') {
        const timeDiff = parseInt(timeDiffString)
        if (timeDiff > 0) {
            const timeString = secondsToTime(timeDiff)
            return conv.close(conv.dict.o_schedstage_002(timeString))
        } 
    }

    if (modeKey == gameModeKeyValues.ranked) {
        return conv.close(conv.dict.o_schedstage_001)
    }

    return conv.close(conv.dict.o_schedstage_003(stageName))
}