import * as Alexa from 'alexa-sdk'

type PendanticTextFieldType = { type: Alexa.TextContentType, text: string }

export class ImageFreeItemBuilder extends Alexa.templateBuilders.ListItemBuilder {
    /**
     * Add an item to the list of template
     * 
     * @param {string} token 
     * @param {TextField} primaryText 
     * @param {TextField} secondaryText 
     * @param {TextField} tertiaryText 
     * @memberof ListItemBuilder
     */
    addItemNoImage(token: string, primaryText: Alexa.TextField, secondaryText?: Alexa.TextField, tertiaryText?: Alexa.TextField) {
        const item: Alexa.ListItem = {
            token: token,
            textContent: Alexa.utils.TextUtils.makeTextContent(
                primaryText as PendanticTextFieldType, 
                secondaryText as PendanticTextFieldType, 
                tertiaryText as PendanticTextFieldType)
        }
        this.items.push(item)
        return this
    }
}