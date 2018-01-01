export function secondsToTime(seconds: number): string {
    const minutes = Math.floor((seconds/60)%60)
    const hours = Math.floor((seconds/(60*60))%24)
    const days = Math.floor(seconds/(60*60*24))

    if (hours < 1) {
        return minutes + 'm'
    } else if(days < 1) {
        return hours + 'h ' + minutes + 'm'
    } else {
        return days + 'd ' + hours + 'h ' + minutes + 'm'
    }
}

interface StartTimeSortable {
    start_time: number
}
export function sortByStartTime(a: StartTimeSortable, b: StartTimeSortable): number {
    if (a.start_time === b.start_time) return 0;
    return a.start_time > b.start_time ? 1 : -1
}

interface EndTimeSortable {
    end_time: number
}
export function sortByEndTime(a: EndTimeSortable, b: EndTimeSortable): number {
    if (a.end_time === b.end_time) return 0;
    return a.end_time > b.end_time ? 1 : -1
}