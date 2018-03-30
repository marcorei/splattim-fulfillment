import * as Alexa from 'alexa-sdk'
import { DictProvider, Dict } from '../DictProvider'
import { AttributeHelper } from '../util/Attributes'
import { Phonetics } from '../util/Phonetics'
import { ContentDict } from '../../../i18n/ContentDict'

export class HandlerHelper {
    public readonly dict: Dict
    public readonly lang: string
    public readonly attributeHelper: AttributeHelper
    public readonly phonetics: Phonetics
    public readonly lastSeenDiff: number
    public contentDict: ContentDict

    constructor(public readonly handler: Alexa.Handler<Alexa.Request>) {
        const dictProvider = new DictProvider(handler)
        this.dict = dictProvider.getDict()
        this.lang = dictProvider.getLang()
        this.attributeHelper = new AttributeHelper(handler)
        this.phonetics = new Phonetics(dictProvider.getLang())
        this.lastSeenDiff = this.attributeHelper.updateLastSeen()
    }

    // Builder

    withContentDict(contentDict: ContentDict) : HandlerHelper {
        this.contentDict = contentDict
        return this
    }

    // Info shortcuts

    hasDisplay() : boolean {
        return this.handler.event.context.System.device.supportedInterfaces.Display
    }

    // Quick Helper

    replace(input: string) : string {
        return this.phonetics.replace(input)
    }

    speakRplc(input: string) {
        this.handler.response.speak(this.replace(input))
    }

    listenRplc(input: string) {
        this.handler.response.listen(this.replace(input))
    }

    emit() {
        this.handler.emit(':responseReady')
    }

    speakRplcEmit(input: string) {
        this.speakRplc(input)
        this.emit()
    }

    speakListenRplcEmit(speak: string, listen: string) {
        this.speakRplc(speak)
        this.listenRplc(listen)
        this.emit()
    }
}