import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { SplatfestAggregator } from '../../../procedure/aggregate/SplatfestAggregator'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { nowInSplatFormat } from '../../../util/utils'
import { Festival } from '../../../splatoon2ink/model/Splatfest'
import { RegionSlot } from '../model/RegionSlot'
import { secondsToTime, wrapTimeString } from '../util/utils'
import { HandlerHelper, CanHandleHelper } from '../util/HandlerHelper'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('RequestSplatfestUpcoming')
    })
}

export function handle(input: HandlerInput) : Promise<Response> {
    return HandlerHelper.get(input).then(helper => {
        
        if (helper.isIncompleteIntent()) return helper.delegate()
        const slotParser = new SlotParser(input, helper.dict)
        const requestedRegion = slotParser.string(RegionSlot.key)
        if (!slotParser.isOk()) return slotParser.tellAndLog()

        const converter = new Converter()
        const regionId = converter.regionToApi(requestedRegion)
        return new SplatfestAggregator(helper.lang).latestFestival(regionId)
            .then(result => respond(helper.withContentDict(result.contentDict), result.content))
            .catch(error => {
                console.error(error)
                return helper.speakRplcEmit(helper.dict.global_error_default)
            })

    })
}

function respond(helper: HandlerHelper, fest: Festival) {
    const now = nowInSplatFormat()
    const translated = helper.contentDict.festival(fest, helper.dict.global_name_pearl, helper.dict.global_name_marina)

    if (now >= fest.times.end) {
        return helper.speakRplcEmit(helper.dict.a_splup_000)
    }
    
    var subtitle: string
    if (now >= fest.times.start) {
        const timeString = secondsToTime(fest.times.end - now)
        helper.speakRplc(helper.dict.a_splup_003_s(
            wrapTimeString(timeString), translated.alpha, translated.bravo))
        subtitle = helper.dict.a_splup_003_b(timeString)
    } else {
        const timeString = secondsToTime(fest.times.start - now)
        helper.speakRplc(helper.dict.a_splup_004_s(
            wrapTimeString(timeString), translated.alpha, translated.bravo))
        subtitle = helper.dict.a_splup_004_b(timeString)
    } 
    
    if (helper.hasDisplay()) {
        helper.addCard({
            title: helper.dict.a_splup_001(translated.alpha, translated.bravo),
            content: subtitle,
            image: getSplatnetResUrl(fest.images.panel)
        })
    }

    return helper.emit()
}