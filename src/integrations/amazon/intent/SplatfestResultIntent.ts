import * as Alexa from 'alexa-sdk'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { resultsToInfo } from '../../../procedure/transform/SplatfestMapper'
import { SplatfestAggregator, FestivalResultTuple } from '../../../procedure/aggregate/SplatfestAggregator'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { RegionSlot } from '../model/RegionSlot'
import { HandlerHelper } from '../util/HandlerHelper'

export const name = 'RequestSplatfestResult'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const helper = new HandlerHelper(this)

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, helper.dict)
    const requestedRegion = slotParser.string(RegionSlot.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    const converter = new Converter()
    const regionId = converter.regionToApi(requestedRegion)
    return new SplatfestAggregator(helper.lang).latestResult(regionId)
        .then(result => respond(helper.withContentDict(result.contentDict), result.content))
        .catch(error => {
            console.error(error)
            return helper.speakRplcEmit(helper.dict.global_error_default)
        })
}

function respond(helper: HandlerHelper, tuple: FestivalResultTuple) {
    const translatedNames = helper.contentDict.festival(tuple.festival)
    const info = resultsToInfo(translatedNames, tuple.result, helper.dict, false)
    const image = getSplatnetResUrl(tuple.festival.images.panel)

    helper.speakRplc(`${info.part1} ${info.part2}`)

    if (helper.hasDisplay()) {
        helper.handler.response.cardRenderer(
            helper.dict.a_splres_003(info.alpha, info.bravo), 
            helper.dict.a_splres_006(`${info.winner}\n${info.rates}`), 
            {
                smallImageUrl: image,
                largeImageUrl: image
            })
    }

    return helper.emit()
}