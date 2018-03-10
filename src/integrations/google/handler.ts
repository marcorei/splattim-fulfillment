import * as express from 'express'
import * as bodyParser from 'body-parser'
const serverless = require('serverless-http')
import { createDialogflowApp } from './app'

export const expressApp = express()
expressApp.use(bodyParser.json());
expressApp.post('/splattimgoogle', function (request, response) {
    createDialogflowApp(request, response)
})

module.exports.splatTim = serverless(expressApp)