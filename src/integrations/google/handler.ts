import { OmniHandler } from 'actions-on-google'
import { createApp } from './app'

let app: OmniHandler | undefined

module.exports.splatTim = function(event: any, context: any, callback: any) {
    if (!app) {
        app = createApp()
    }
    return app(event, context, callback)
}