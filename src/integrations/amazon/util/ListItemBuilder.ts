import { interfaces } from 'ask-sdk-model'

export class ListItemBuilder {
    private item: interfaces.display.ListItem

    constructor(token: string) {
        this.item = {
            token: token
        }
    }

    addImage(url: string) : ListItemBuilder {
        this.item.image = {
            sources: [{
                url: url
            }]
        } 
        return this
    }

    addPlainText(primary: string, secondary?: string, tertiary?: string) : ListItemBuilder {
        const textContent: interfaces.display.TextContent = {}
        textContent.primaryText = {
            type: 'PlainText',
            text: primary
        }
        if (secondary) {
            textContent.secondaryText = {
                type: 'PlainText',
                text: secondary
            }
        }
        if (tertiary) {
            textContent.tertiaryText = {
                type: 'PlainText',
                text: tertiary
            }
        }
        return this
    }

    build() : interfaces.display.ListItem {
        return this.item
    }
}