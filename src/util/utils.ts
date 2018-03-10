export type SecondsToTimeType = (seconds: number) => string

interface StartTimeSortable {
    start_time: number
}
export function sortByStartTime(a: StartTimeSortable, b: StartTimeSortable): number {
    if (a.start_time === b.start_time) return 0
    return a.start_time > b.start_time ? 1 : -1
}

interface EndTimeSortable {
    end_time: number
}
export function sortByEndTime(a: EndTimeSortable, b: EndTimeSortable): number {
    if (a.end_time === b.end_time) return 0
    return a.end_time > b.end_time ? 1 : -1
}

export function nowInSplatFormat(): number {
    return Math.round(new Date().getTime() / 1000)
}

export function randomEntry<T>(arr: T[]) : T {
    return arr[Math.floor(Math.random() * arr.length)]
}