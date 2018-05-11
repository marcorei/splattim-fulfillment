import { CustomConversation } from '../util/CustomConversation'
import { RichResponse, SimpleResponse, LinkOutSuggestion } from 'actions-on-google'

export const names = ['Help']

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(conv: CustomConversation) {
    const dict = conv.dict
    const text = dict.s_help_complete

    return conv.ask(new RichResponse()
        .add(new SimpleResponse({
            speech: text,
            text: text
        }))
        .add(new LinkOutSuggestion({
            name: dict.global_suggest_command_link_name,
            url: dict.global_suggest_command_link_url
        }))) 
}