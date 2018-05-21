import { HandlerInput } from 'ask-sdk-core'
import { Response } from 'ask-sdk-model'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { resultsToInfo } from '../../../procedure/transform/SplatfestMapper'
import { SplatfestAggregator, FestivalResultTuple } from '../../../procedure/aggregate/SplatfestAggregator'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'
import { RegionSlot } from '../model/RegionSlot'
import { HandlerHelper, CanHandleHelper } from '../util/HandlerHelper'

export function canHandle(input: HandlerInput) : Promise<boolean> {
    return CanHandleHelper.get(input).then(helper => {
        return helper.isIntent('RequestSplatfestResult')
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
        return new SplatfestAggregator(helper.lang).latestResult(regionId)
            .then(result => respond(helper.withContentDict(result.contentDict), result.content))
            .catch(error => {
                console.error(error)
                return helper.speakRplcEmit(helper.dict.global_error_default)
            })

    })
}

function respond(helper: HandlerHelper, tuple: FestivalResultTuple) {
    const translatedNames = helper.contentDict.festival(tuple.festival, helper.dict.global_name_pearl, helper.dict.global_name_marina)
    const info = resultsToInfo(translatedNames, tuple.result, helper.dict, false)
    const image = getSplatnetResUrl(tuple.festival.images.panel)

    helper.speakRplc(`${info.part1} ${info.part2}`)

    if (helper.hasDisplay()) {
        helper.addCard({
            title: helper.dict.a_splres_003(info.alpha, info.bravo),
            content: helper.dict.a_splres_006(`${info.winner}\n${info.rates}`),
            image: image
        })
    }

    return helper.emit()
}