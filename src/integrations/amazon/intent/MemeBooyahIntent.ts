import * as Alexa from 'alexa-sdk'
import { randomEntry } from '../../../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'
import { SoundFx } from '../../../resources/SoundFx';

export const name = 'MemeBooyah'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)
    return helper.speakRplcEmit(woomyPrefix(helper.dict.s_meme_booyah))
}

function woomyPrefix(input: string) : string {
    let soundFx = new SoundFx()
    let sound = randomEntry([
        soundFx.ngyes(),
        soundFx.squeemy()
    ])
    return `${sound} ${input}`
}