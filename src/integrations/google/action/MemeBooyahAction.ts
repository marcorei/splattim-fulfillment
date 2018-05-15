import { CustomConversation } from '../util/CustomConversation'
import { SimpleResponse } from 'actions-on-google'
import { randomEntry, wrapWithSpeak } from '../../../util/utils'
import { SoundFx } from '../../../resources/SoundFx'

export const names = ['Meme - Booyah!']

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(conv: CustomConversation) {
    const dict = conv.dict
    const text = dict.s_meme_booyah

    return conv.close(new SimpleResponse({
        speech: woomyPrefix(text),
        text: text
    }))
}

function woomyPrefix(input: string) : string {
    let soundFx = new SoundFx()
    let sound = randomEntry([
        soundFx.ngyes(),
        soundFx.squeemy()
    ])
    return wrapWithSpeak(`${sound} ${input}`)
}