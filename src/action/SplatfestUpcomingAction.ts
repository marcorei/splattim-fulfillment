import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
import { Splatoon2inkApi, getSplatnetResUrl } from '../data/Splatoon2inkApi'
import { ArgParser } from '../common/dfUtils'
import { RegionArg } from '../entity/dialog/RegionArg'
import { Festival } from '../entity/api/Splatfest'
import { nowInSplatFormat, secondsToTime } from '../common/utils'

export const name = 'splatfest_upcoming'

/**
 * Tells if there is an active Splatfest or an upcoming on
 * annouced recently.
 */
export function handler(app: I18NDialogflowApp) {
    const argParser = new ArgParser(app)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()
    
    return new Splatoon2inkApi().readSplatfest()
        .then(splatfest => {
            switch (requestedRegion) {
                case RegionArg.values.eu:
                    return splatfest.eu
                case RegionArg.values.na:
                    return splatfest.na
                case RegionArg.values.jp:
                    return splatfest.jp
                default: throw new Error('Unknow region')
            }
        })
        .then(region =>{
            if (region.festivals.length === 0) {
                throw new Error('No splafests found')
            }
            const sorted = region.festivals
                .sort((a, b) => {
                    if (a.times.start === b.times.start) return 0
                    return a.times.start > b.times.start ? -1 : 1
                })
            return sorted[0]
        })
        .then(fest => respond(app, fest))
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}


function respond(app: I18NDialogflowApp, fest: Festival) {
    const dict = app.getDict()
    const now = nowInSplatFormat()

    if (now >= fest.times.end) {
        return app.tell(dict.a_splup_000)
    }

    const card = app.buildBasicCard()
        .setTitle(dict.a_splup_001(fest.names.alpha_short, fest.names.bravo_short))
        .setImage(getSplatnetResUrl(fest.images.panel), dict.a_splup_002)

    if (now >= fest.times.start) {
        const timeTillEnd = secondsToTime(fest.times.end - now)
        return app.tell(app.buildRichResponse()
            .addSimpleResponse({
                speech: dict.a_splup_003_s(timeTillEnd, fest.names.alpha_short, fest.names.bravo_short),
                displayText: dict.a_splup_003_t(timeTillEnd)
            })
            .addBasicCard(card
                .setSubtitle(dict.a_splup_003_b(timeTillEnd))))
    }
    console.log(`#now   - ${now}`)
    console.log(`#start - ${fest.times.start}`)
    console.log(`${fest.times.start - now}`)
    const timeTillStart = secondsToTime(fest.times.start - now)
    return app.tell(app.buildRichResponse()
        .addSimpleResponse({
            speech: dict.a_splup_004_s(timeTillStart, fest.names.alpha_short, fest.names.bravo_short),
            displayText: dict.a_splup_004_t(timeTillStart)
        })
        .addBasicCard(card
            .setSubtitle(dict.a_splup_004_b(timeTillStart))))
}
