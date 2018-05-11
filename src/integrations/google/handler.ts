import { OmniHandler } from 'actions-on-google'
// import * as express from 'express'
// import * as bodyParser from 'body-parser'
// const serverless = require('serverless-http')
import { createApp } from './app'

// export const expressApp = express()
// expressApp.use(bodyParser.json());
// expressApp.post('/splattimgoogle', function (request, response) {
//     app(request, response)
// })

// module.exports.splatTim = serverless(expressApp)

let app: OmniHandler | undefined

module.exports.splatTim = function(event: any, context: any, callback: any) {
    if (!app) {
        app = createApp()
    }
    return app(event, context, callback)
}