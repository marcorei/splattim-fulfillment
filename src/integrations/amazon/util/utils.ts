import { SecondsToTimeType } from '../../../util/utils'

export const secondsToTime: SecondsToTimeType = (seconds: number) => {
    if (seconds < 1) return ''

    const minutes = Math.floor((seconds/60)%60)
    const hours = Math.floor((seconds/(60*60))%24)
    const days = Math.floor(seconds/(60*60*24))

    if (hours < 1 && days < 1) {
        return minutes + 'min'
    } else if(days < 1) {
        return hours + 'h ' + minutes + 'min'
    } else {
        return days + 'd ' + hours + 'h ' + minutes + 'min'
    }
}

export function wrapTimeString(timeString: string) : string {
    return `<say-as interpret-as="unit">${timeString}</say-as>`
}