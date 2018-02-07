import { I18NDialogflowApp } from '../i18n/I18NDialogflowApp'
import { getSplatnetResUrl } from '../data/Splatoon2inkApi'
import { ArgParser } from '../common/dfUtils'
import { RegionArg } from '../entity/dialog/RegionArg'
import { Festival } from '../entity/api/Splatfest'
import { nowInSplatFormat, secondsToTime } from '../common/utils'
import { I18NSplatoon2API } from '../i18n/I18NSplatoon2Api'
import { ContentDict } from '../i18n/ContentDict'

export const name = 'splatfest_upcoming'

/**
 * Tells if there is an active Splatfest or an upcoming on
 * annouced recently.
 */
export function handler(app: I18NDialogflowApp) {
    const argParser = new ArgParser(app)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()
    
    return new I18NSplatoon2API(app).readSplatfest()
        .then(result => {
            return Promise.resolve(result.content)
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
                .then(fest => respond(app, result.contentDict, fest))
        })
        .catch(error => {
            console.error(error)
            app.tell(app.getDict().global_error_default)
        })
}


function respond(app: I18NDialogflowApp, contentDict: ContentDict, fest: Festival) {
    const dict = app.getDict()
    const now = nowInSplatFormat()
    const translated = contentDict.festival(fest)

    if (now >= fest.times.end) {
        return app.tell(dict.a_splup_000)
    }

    const card = app.buildBasicCard()
        .setTitle(dict.a_splup_001(translated.alpha, translated.bravo))
        .setImage(getSplatnetResUrl(fest.images.panel), dict.a_splup_002)

    if (now >= fest.times.start) {
        const timeTillEnd = secondsToTime(fest.times.end - now)
        return app.tell(app.buildRichResponse()
            .addSimpleResponse({
                speech: dict.a_splup_003_s(timeTillEnd, translated.alpha, translated.bravo),
                displayText: dict.a_splup_003_t(timeTillEnd)
            })
            .addBasicCard(card
                .setSubtitle(dict.a_splup_003_b(timeTillEnd))))
    }

    const timeTillStart = secondsToTime(fest.times.start - now)
    return app.tell(app.buildRichResponse()
        .addSimpleResponse({
            speech: dict.a_splup_004_s(timeTillStart, translated.alpha, translated.bravo),
            displayText: dict.a_splup_004_t(timeTillStart)
        })
        .addBasicCard(card
            .setSubtitle(dict.a_splup_004_b(timeTillStart))))
}
