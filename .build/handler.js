"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const serverless = require('serverless-http');
const app_1 = require("./src/app");
exports.expressApp = express();
exports.expressApp.use(bodyParser.json());
exports.expressApp.post('/splattim', function (request, response) {
    app_1.createDialogflowApp(request, response);
});
module.exports.splatTim = serverless(exports.expressApp);
//# sourceMappingURL=handler.js.map