"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function secondsToTime(seconds) {
    const minutes = Math.floor((seconds / 60) % 60);
    const hours = Math.floor((seconds / (60 * 60)) % 24);
    const days = Math.floor(seconds / (60 * 60 * 24));
    if (hours < 1) {
        return minutes + 'm';
    }
    else if (days < 1) {
        return hours + 'h ' + minutes + 'm';
    }
    else {
        return days + 'd ' + hours + 'h ' + minutes + 'm';
    }
}
exports.secondsToTime = secondsToTime;
//# sourceMappingURL=utils.js.map