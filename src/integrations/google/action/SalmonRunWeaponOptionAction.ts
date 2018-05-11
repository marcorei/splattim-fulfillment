import { CustomConversation } from '../util/CustomConversation'
import { OptionArgument, Parameters } from 'actions-on-google'
const seperator = '_'

export const name = 'grizzco-option-weapon'

export function buildOptionKey(weaponName: string): string {
    return [
        'SRWEAPON',
        weaponName
    ].join(seperator)
}

/**
 * Replies to a salmon run weapon selected previously.
 */
export function handler(conv: CustomConversation, params: Parameters,  optionKey: OptionArgument) {
    const optionKeyParts = optionKey.split(seperator)
    if (optionKeyParts.length < 2) {
        return conv.close(conv.dict.o_srweapon_000)
    }
    const weaponName = optionKeyParts[1]

    if (Math.random() > 0.5) {
        return conv.close(conv.dict.o_srweapon_001(weaponName))
    }

    return conv.close(conv.dict.o_srweapon_002(weaponName))
}