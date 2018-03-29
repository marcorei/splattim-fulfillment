import { I18NDialogflowApp } from '../I18NDialogflowApp'

export const name = 'help'

/**
 * Lists all available gear as carousel.
 * Also gives a shorter spech overview.
 */
export function handler(app: I18NDialogflowApp) {
    const dict = app.getDict()

    const text = dict.s_help_complete
    return app.ask(app.buildRichResponse()
        .addSimpleResponse({
            speech: text,
            displayText: text
        })
        .addSuggestionLink(
            dict.global_suggest_command_link_name,
            dict.global_suggest_command_link_url
        ))   
}