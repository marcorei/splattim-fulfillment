"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_on_google_1 = require("actions-on-google");
const AllSchedulesAction = require("./actions/AllSchedulesAction");
const EtaForRuleAction = require("./actions/EtaForRuleAction");
const MerchandiseAction = require("./actions/MerchandiseAction");
const SalmonRunAction = require("./actions/SalmonRunAction");
const SchedulesAction = require("./actions/SchedulesAction");
function createDialogflowApp(request, response) {
    const dialogflowApp = new actions_on_google_1.DialogflowApp({ request, response });
    const actions = [
        AllSchedulesAction,
        EtaForRuleAction,
        MerchandiseAction,
        SalmonRunAction,
        SchedulesAction
    ];
    const actionMap = new Map();
    actions.forEach(action => actionMap.set(action.name, action.handler));
    dialogflowApp.handleRequest(actionMap);
}
exports.createDialogflowApp = createDialogflowApp;
//# sourceMappingURL=app.js.map