import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { randomEntry, wrapWithSpeak } from '../../../util/utils'
import { SoundFx } from '../../../resources/SoundFx'

export const name = 'booyah'

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(app: I18NDialogflowApp) {
    const dict = app.getDict()

    const text = dict.s_meme_booyah
    return app.tell(app.buildRichResponse()
        .addSimpleResponse({
            speech: woomyPrefix(text),
            displayText: text
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