import { I18NDialogflowApp } from '../I18NDialogflowApp'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { ArgParser } from '../util/ArgParser'
import { RegionArg } from '../model/RegionArg'
import { Festival } from '../../../splatoon2ink/model/Splatfest'
import { nowInSplatFormat, secondsToTime } from '../../../util/utils'
import { ContentDict } from '../../../i18n/ContentDict'
import { Converter } from '../util/Converter'
import { SplatfestAggregator } from '../../../procedure/aggregate/SplatfestAggregator'

export const name = 'splatfest_upcoming'

/**
 * Tells if there is an active Splatfest or an upcoming on
 * annouced recently.
 */
export function handler(app: I18NDialogflowApp) {
    const argParser = new ArgParser(app)
    const requestedRegion = argParser.string(RegionArg.key)
    if (!argParser.isOk()) return argParser.tellAndLog()
    
    const converter = new Converter()
    const regionId = converter.regionToApi(requestedRegion)
    new SplatfestAggregator(app.getLang()).latestFestival(regionId)
        .then(result => respond(app, result.contentDict, result.content))
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
