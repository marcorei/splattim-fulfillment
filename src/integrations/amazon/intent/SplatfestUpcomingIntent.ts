import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { ContentDict } from '../../../i18n/ContentDict'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { SplatfestAggregator } from '../../../procedure/aggregate/SplatfestAggregator'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { nowInSplatFormat } from '../../../util/utils'
import { Festival } from '../../../splatoon2ink/model/Splatfest'
import { RegionSlot } from '../model/RegionSlot'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { AttributeHelper } from '../util/Attributes'

export const name = 'RequestSplatfestUpcoming'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    new AttributeHelper(this).updateLastSeen()
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, dict)
    const requestedRegion = slotParser.string(RegionSlot.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    const converter = new Converter()
    const regionId = converter.regionToApi(requestedRegion)
    return new SplatfestAggregator(dictProvider.getLang()).latestFestival(regionId)
        .then(result => respond(this, dict, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            this.response.speak(dict.global_error_default)
            return this.emit(':responseReady')
        })
}

function respond(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, fest: Festival) {
    const now = nowInSplatFormat()
    const translated = contentDict.festival(fest)

    if (now >= fest.times.end) {
        handler.response.speak(dict.a_splup_000)
        return handler.emit(':responseReady')
    }
    
    var subtitle: string
    if (now >= fest.times.start) {
        const timeString = secondsToTime(fest.times.end - now)
        handler.response.speak(dict.a_splup_003_s(wrapTimeString(timeString), translated.alpha, translated.bravo))
        subtitle = dict.a_splup_003_b(timeString)
    } else {
        const timeString = secondsToTime(fest.times.start - now)
        handler.response.speak(dict.a_splup_004_s(wrapTimeString(timeString), translated.alpha, translated.bravo))
        subtitle = dict.a_splup_004_b(timeString)
    } 
    
    if (handler.event.context.System.device.supportedInterfaces.Display) {
        const image = getSplatnetResUrl(fest.images.panel)
        handler.response.cardRenderer(
            dict.a_splup_001(translated.alpha, translated.bravo), 
            subtitle, 
            {
                smallImageUrl: image,
                largeImageUrl: image
            })
    }

    return handler.emit(':responseReady')
}