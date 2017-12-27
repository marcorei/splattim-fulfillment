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