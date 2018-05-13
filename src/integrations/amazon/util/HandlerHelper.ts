import { HandlerInput, ResponseBuilder } from 'ask-sdk-core'
import { Response, interfaces, IntentRequest } from 'ask-sdk-model'
import { DictProvider, Dict } from '../DictProvider'
import { AttributeHelper } from '../util/Attributes'
import { Phonetics } from '../util/Phonetics'
import { ContentDict } from '../../../i18n/ContentDict'
import { isNullOrUndefined } from 'util'

export class CanHandleHelper {
    static get(handlerInput: HandlerInput) : Promise<CanHandleHelper> {
        return Promise.resolve(new CanHandleHelper(handlerInput))
    }

    private constructor(private handlerInput: HandlerInput) {}

    isIntent(intentName: string) : boolean {
        return this.handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && this.handlerInput.requestEnvelope.request.intent.name === intentName
    }

    isType(requestType: string) : boolean {
        return this.handlerInput.requestEnvelope.request.type === requestType
    }
}

export class HandlerHelper {
    public readonly dict: Dict
    public readonly lang: string
    public readonly attributeHelper: AttributeHelper
    public readonly phonetics: Phonetics
    public lastSeenDiff: number
    public contentDict: ContentDict

    static get(handlerInput: HandlerInput) : Promise<HandlerHelper> {
        const helper = new HandlerHelper(handlerInput)
        return helper.init()
    }

    private constructor(public readonly handlerInput: HandlerInput) {
        const dictProvider = new DictProvider(handlerInput)
        this.dict = dictProvider.getDict()
        this.lang = dictProvider.getLang()
        this.attributeHelper = new AttributeHelper(handlerInput)
        this.phonetics = new Phonetics(dictProvider.getLang())

        // End the session per default.
        handlerInput.responseBuilder.withShouldEndSession(true)
    }

    private init() : Promise<HandlerHelper> {
        return this.attributeHelper.updateLastSeen()
            .then(diff => {
                this.lastSeenDiff = diff
                return this
            })
    }

    // Builder

    withContentDict(contentDict: ContentDict) : HandlerHelper {
        this.contentDict = contentDict
        return this
    }

    // Info shortcuts

    hasDisplay() : boolean {
        return !isNullOrUndefined(this.handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display)
    }

    isIncompleteIntent() : boolean {
        const intentRequest: IntentRequest = this.handlerInput.requestEnvelope.request as IntentRequest
        if (!intentRequest.dialogState) {
            // Request is not actually an intent request.
            return false
        }
        return intentRequest.dialogState !== 'COMPLETED'
    }

    // Quick Helper

    addTemplate(template: interfaces.display.Template) : ResponseBuilder {
        return this.handlerInput.responseBuilder.addRenderTemplateDirective(template)
    }

    addCard(template: CardTemplate) : ResponseBuilder {
        return this.handlerInput.responseBuilder.withStandardCard(
            template.title, template.content, template.image, template.image)
    }

    replace(input: string) : string {
        return this.phonetics.replace(input)
    }

    speakRplc(input: string) : ResponseBuilder {
        return this.handlerInput.responseBuilder
            .speak(this.replace(input))
    }

    listenRplc(input: string) {
        return this.handlerInput.responseBuilder
            .withShouldEndSession(false)
            .reprompt(this.replace(input))
    }

    emit() : Response {
        return this.handlerInput.responseBuilder.getResponse()
    }

    speakRplcEmit(input: string) : Response {
        this.speakRplc(input)
        return this.emit()
    }

    speakListenRplcEmit(speak: string, listen: string) : Response {
        this.speakRplc(speak)
        this.listenRplc(listen)
        return this.emit()
    }

    delegate() : Response {
        return this.handlerInput.responseBuilder
            .withShouldEndSession(false)
            .addDelegateDirective()
            .getResponse()
    }
}

export type CardTemplate = {
    title: string, 
    content: string, 
    image: string
}