"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const Splatoon2inkApi_1 = require("../data/Splatoon2inkApi");
const config_1 = require("../config");
const GameModeArg_1 = require("../model/dialog/GameModeArg");
const utils_1 = require("../common/utils");
const resolver_1 = require("../i18n/resolver");
exports.name = 'all_schedules';
function handler(app) {
    const dict = resolver_1.getDict(app);
    const gameModeArgValue = app.getArgument(GameModeArg_1.GameModeArg.key); // Required
    if (util_1.isNullOrUndefined(gameModeArgValue)) {
        console.error('required parameter is missing: ' + GameModeArg_1.GameModeArg.key);
        app.tell(dict.global_error_missing_param);
        return;
    }
    const requestedGameMode = gameModeArgValue.toString();
    return new Splatoon2inkApi_1.Splatoon2inkApi().getSchedules()
        .then(schedules => {
        switch (requestedGameMode) {
            case GameModeArg_1.GameModeArg.values.regular:
                repondWithScheduleList(app, dict, schedules.regular);
                break;
            case GameModeArg_1.GameModeArg.values.ranked:
                repondWithScheduleList(app, dict, schedules.gachi);
                break;
            case GameModeArg_1.GameModeArg.values.league:
                repondWithScheduleList(app, dict, schedules.league);
                break;
            case GameModeArg_1.GameModeArg.values.all:
            default:
                app.tell(dict.a_asched_error_too_much);
        }
    })
        .catch(error => {
        console.error(error);
        app.tell(dict.global_error_default);
    });
}
exports.handler = handler;
// Responder
function repondWithScheduleList(app, dict, schedules) {
    if (util_1.isNullOrUndefined(schedules) || schedules.length === 0) {
        app.tell(dict.a_asched_error_empty_data);
        return;
    }
    const sortedSchedules = schedules.sort((a, b) => {
        if (a.start_time === b.start_time)
            return 0;
        return a.start_time > b.start_time ? 1 : -1;
    });
    const now = Math.round(new Date().getTime() / 1000);
    const mode = dict.api_sched_mode(schedules[0].game_mode.key, schedules[0].game_mode.name);
    app.askWithCarousel(dict.a_asched_000(mode), app.buildCarousel()
        .addItems(sortedSchedules.reduce((arr, schedule) => {
        arr.push(buildStageOptionItem(app, dict, now, schedule.stage_a, schedule), buildStageOptionItem(app, dict, now, schedule.stage_b, schedule));
        return arr;
    }, [])));
}
// Item Builder
function buildStageOptionItem(app, dict, now, stage, schedule) {
    let timeString = now >= schedule.start_time ?
        dict.a_asched_001_now :
        dict.a_asched_001_future + utils_1.secondsToTime(schedule.start_time - now);
    return app.buildOptionItem('STAGE_' + stage.id + '_' + schedule.id)
        .setTitle(stage.name)
        .setDescription(timeString + ' - ' + schedule.rule.name)
        .setImage(config_1.config.splatoonInk.baseUrl + config_1.config.splatoonInk.assets.splatnet + stage.image, stage.name);
}
//# sourceMappingURL=AllSchedulesAction.js.map