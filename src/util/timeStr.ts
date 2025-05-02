function lead0(s: string|number) {
    return `0${s}`.slice(-Math.max(2, (typeof s === 'string' ? s.length : Math.log10(s) + 1)))
}

export function getTodayStr() {
    const today = new Date()
    const month = lead0(today.getMonth() + 1)
    const day = lead0(today.getDate())
    return `${month}月${day}日`
}

export function getHMSStr() {
    const now = new Date()
    const hours = lead0(now.getHours())
    const minutes = lead0(now.getMinutes())
    const seconds = lead0(now.getSeconds())
    return `${hours}:${minutes}:${seconds}`
}

export function parseHMS(s: string) {
    const [hours, minutes, seconds] = s.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        throw new Error('Invalid time format. Expected format: HH:MM:SS')
    }
    return hours * 3600 + minutes * 60 + seconds
}

export function getMSStr(duration: number) {
    const minutes = lead0(Math.floor(duration / 60))
    const seconds = lead0(Math.floor(duration % 60))
    return `${minutes}:${seconds}`
}

export function parseMS(s: string) {
    const [minutes, seconds] = s.split(':').map(Number)
    if (isNaN(minutes) || isNaN(seconds)) {
        throw new Error('Invalid time format. Expected format: MM:SS')
    }
    return minutes * 60 + seconds
}