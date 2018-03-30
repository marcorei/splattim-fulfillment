import * as Alexa from 'alexa-sdk'
import { randomEntry } from '../../../util/utils'
import { HandlerHelper } from '../util/HandlerHelper'
import { SoundFx } from '../../../resources/SoundFx'

export const name = 'LaunchRequest'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    if (helper.lastSeenDiff < 0) {
        // New User

        const text = `${helper.dict.s_welcome_hi_001} ${helper.dict.s_welcome_intro} ${helper.dict.s_welcome_help_long}`
        return helper.speakListenRplcEmit(
            woomyPrefix(text),
            helper.dict.global_reprompt)
    }

    const daysDiff = Math.floor(helper.lastSeenDiff / (1000 * 3600 * 24))

    if (daysDiff < 14) {
        // Recently visited

        const hi = randomEntry([
            helper.dict.s_welcome_hi_000,
            helper.dict.s_welcome_hi_001
        ]) 
        const help = randomEntry([
            helper.dict.s_welcome_help_short_000,
            helper.dict.s_welcome_help_short_001
        ])
        const text = `${hi} ${help}`
        return helper.speakListenRplcEmit(
            woomyPrefix(text),
            helper.dict.global_reprompt)
    } else {
        // repeat help stuff

        const text = `${helper.dict.s_welcome_intro} ${helper.dict.s_welcome_returning} ${helper.dict.s_welcome_help_long}`
        return helper.speakListenRplcEmit(
            woomyPrefix(text),
            helper.dict.global_reprompt)
    }
}

function woomyPrefix(input: string) : string {
    let soundFx = new SoundFx()
    let sound = randomEntry([
        soundFx.ngyes(),
        soundFx.squeemy()
    ])
    return `${sound} ${input}`
}