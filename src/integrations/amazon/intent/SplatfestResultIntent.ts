import * as Alexa from 'alexa-sdk'
import { Dict, DictProvider } from '../DictProvider'
import { ContentDict } from '../../../i18n/ContentDict'
import { SlotParser } from '../util/SlotParser'
import { Converter } from '../util/Converter'
import { RegionArg } from '../../google/model/RegionArg'
import { resultsToInfo } from '../../../procedure/transform/SplatfestMapper'
import { SplatfestAggregator, FestivalResultTuple } from '../../../procedure/aggregate/SplatfestAggregator'
import { getSplatnetResUrl } from '../../../splatoon2ink/Splatoon2inkApi'

export const name = 'RequestSplatfestResult'

export function handler(this: Alexa.Handler<Alexa.Request>) {
    const dictProvider = new DictProvider(this)
    const dict = dictProvider.getDict()

    if (this.event.request['dialogState'] !== 'COMPLETED'){
        return this.emit(':delegate')
    }
    const slotParser = new SlotParser(this, dict)
    const requestedRegion = slotParser.string(RegionArg.key)
    if (!slotParser.isOk()) return slotParser.tellAndLog()

    const converter = new Converter()
    const regionId = converter.regionToApi(requestedRegion)
    return new SplatfestAggregator(dictProvider.getLang()).latestResult(regionId)
        .then(result => respond(this, dict, result.contentDict, result.content))
        .catch(error => {
            console.error(error)
            this.response.speak(dict.global_error_default)
            return this.emit(':responseReady')
        })
}

function respond(handler: Alexa.Handler<Alexa.Request>, dict: Dict, contentDict: ContentDict, tuple: FestivalResultTuple) {
    const translatedNames = contentDict.festival(tuple.festival)
    const info = resultsToInfo(translatedNames, tuple.result, dict)
    const image = getSplatnetResUrl(tuple.festival.images.panel)

    handler.response.speak(`${info.part1} ${info.part2}`)

    if (handler.event.context.System.device.supportedInterfaces.Display) {
        handler.response.cardRenderer(
            dict.a_splres_003(info.alpha, info.bravo), 
            dict.a_splres_006(`${info.winner}\n${info.rates}`), 
            {
                smallImageUrl: image,
                largeImageUrl: image
            })
    }

    return handler.emit(':responseReady')
}