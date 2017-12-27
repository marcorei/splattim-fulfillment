"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const Splatoon2inkApi_1 = require("../data/Splatoon2inkApi");
const config_1 = require("../config");
const GameModeArg_1 = require("../model/dialog/GameModeArg");
const GameRuleArg_1 = require("../model/dialog/GameRuleArg");
const resolver_1 = require("../i18n/resolver");
const utils_1 = require("../common/utils");
exports.name = 'eta_rule';
function handler(app) {
    const dict = resolver_1.getDict(app);
    const gameModeArgValue = app.getArgument(GameModeArg_1.GameModeArg.key); // Required
    const gameRuleArgValue = app.getArgument(GameRuleArg_1.GameRuleArg.key); // Required
    if (util_1.isNullOrUndefined(gameModeArgValue)) {
        console.error('required parameter is missing: ' + GameModeArg_1.GameModeArg.key);
        app.tell(dict.global_error_missing_param);
        return;
    }
    if (util_1.isNullOrUndefined(gameRuleArgValue)) {
        console.error('required parameter is missing: ' + GameRuleArg_1.GameRuleArg.key);
        app.tell(dict.global_error_missing_param);
        return;
    }
    const requestedGameMode = gameModeArgValue.toString();
    const requestedGameRule = gameRuleArgValue.toString();
    switch (requestedGameMode) {
        case GameModeArg_1.GameModeArg.values.league:
        case GameModeArg_1.GameModeArg.values.ranked:
            break;
        case GameModeArg_1.GameModeArg.values.all:
            app.tell(dict.a_eta_error_incomp_mode_all);
            return;
        case GameModeArg_1.GameModeArg.values.regular:
            app.tell(dict.a_eta_error_incomp_mode_regular);
            return;
        default:
            app.tell(dict.a_eta_error_unknown_mode);
            return;
    }
    let ruleMatchString;
    switch (requestedGameRule) {
        case GameRuleArg_1.GameRuleArg.values.blitz:
            ruleMatchString = 'clam_blitz';
            break;
        case GameRuleArg_1.GameRuleArg.values.rainmaker:
            ruleMatchString = 'rainmaker';
            break;
        case GameRuleArg_1.GameRuleArg.values.tower:
            ruleMatchString = 'tower_control';
            break;
        case GameRuleArg_1.GameRuleArg.values.zones:
            ruleMatchString = 'splat_zones';
            break;
        case GameRuleArg_1.GameRuleArg.values.turf:
            app.tell(dict.a_eta_error_incomp_mode_regular);
            return;
        default:
            app.tell(dict.a_eta_error_unknown_rule);
            return;
    }
    return new Splatoon2inkApi_1.Splatoon2inkApi().getSchedules()
        .then(schedules => requestedGameMode == GameModeArg_1.GameModeArg.values.league ?
        schedules.league :
        schedules.gachi)
        .then(schedules => schedules
        .filter(schedule => {
        return schedule.rule.key === ruleMatchString;
    })
        .sort((a, b) => {
        if (a.start_time === b.start_time)
            return 0;
        return a.start_time > b.start_time ? 1 : -1;
    }))
        .then(schedules => {
        if (schedules.length === 0) {
            app.tell(dict.a_eta_000);
        }
        else {
            respondWithSchedule(app, dict, schedules[0]);
        }
    })
        .catch(error => {
        console.error(error);
        app.tell(dict.global_error_default);
    });
}
exports.handler = handler;
// Responder 
function respondWithSchedule(app, dict, schedule) {
    const gameMode = dict.api_sched_mode(schedule.game_mode.key, schedule.game_mode.name);
    const gameRule = dict.api_sched_rule(schedule.rule.key, schedule.rule.name);
    const now = Math.round(new Date().getTime() / 1000);
    const eta = now >= schedule.start_time ?
        dict.a_eta_001_now :
        dict.a_eta_001_future + utils_1.secondsToTime(schedule.start_time - now);
    return app.askWithList({
        speech: dict.a_eta_002_s(gameRule, gameMode, eta),
        displayText: dict.a_eta_002_t(gameRule, gameMode, eta)
    }, app.buildList(dict.a_sched_003(gameMode))
        .addItems([
        buildStageOptionItem(app, dict, schedule.stage_a, schedule.rule),
        buildStageOptionItem(app, dict, schedule.stage_b, schedule.rule)
    ]));
}
// Item Builder
function buildStageOptionItem(app, dict, stage, rule, mode) {
    const ruleName = dict.api_sched_rule(rule.key, rule.name);
    const stageName = dict.api_sched_stage(stage.id, stage.name);
    const desc = !util_1.isNullOrUndefined(mode) ?
        dict.api_sched_mode(mode.key, mode.name) + ' - ' + ruleName :
        ruleName;
    return app.buildOptionItem('STAGE_' + stage.id, [stageName])
        .setTitle(stageName)
        .setDescription(desc)
        .setImage(config_1.config.splatoonInk.baseUrl + config_1.config.splatoonInk.assets.splatnet + stage.image, stage.name);
}
//# sourceMappingURL=EtaForRuleAction.js.map