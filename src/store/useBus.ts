import type { GlobalClickId } from "@/models/globalClick";
import { defineStore } from "pinia";
import { onUnmounted } from "vue";

const busOptionKey =  ["once", "detached", "memory"] as const
interface EventSignature {
    globalClick(id: GlobalClickId): void
    updateTable(): void
    setTimerState(state: 'ready'|'active'|'free'): void
}

interface BusEvent {
    readonly id: number, fn: Function
}
type BusOptionKey = (typeof busOptionKey)[number]
type EventName = keyof EventSignature
type EventPayload<T extends EventName> = Parameters<EventSignature[T]>
type EventFunction<T extends EventName> = EventSignature[T]

type BusOptions = {
    [key in BusOptionKey]?: boolean
}
type BusOptionTask = {
    [key in BusOptionKey]: (...args: [EventName, BusEvent]) => any
}

export const useBus = defineStore('useBus', () => {
    let maxId = 1
    const events: {[name: string]: BusEvent[]} = {}
    const memoryMap = new Map<string, [...any]>()
    const busOptionTask: BusOptionTask = {
        once: (name, e) => {
            const originalFn = e.fn
            e.fn = (...payload: any) => {
                originalFn(...payload)
                off(name, e.id)
            }
        },
        detached: (name, e) => {
            const originalFn = e.fn
            e.fn = (...payload: any) => {
                originalFn(...payload)
            }
        },
        memory: (name) => {
            if (!(memoryMap.has(name)))
                memoryMap.set(name, [])
        }
    }

    return { on, emit, off, has, clear, last }
    
    function on<T extends EventName>(name: T, fn: EventFunction<T>, opt?: BusOptions) {
        if (!has(name)) {
            events[name] = []
        }
        const event = { id: maxId++, fn: fn }
        if (opt) {
            (Object.keys(opt) as BusOptionKey[])
                .filter(k => opt[k])
                .forEach(k => busOptionTask[k](name, event))
        }
        if (event.fn === fn) {
            onUnmounted(() => off(name, event.id))
        }
        events[name].push(event)
        return event.id
    }
    
    function emit<T extends EventName>(name: T, ...payload: EventPayload<T>) {
        if (!has(name)) return
        events[name].forEach(e => {
            try {
                e.fn(...payload)
            } catch (err) {
                console.error(`Error in bus of ${name}: `, err, "\nError at event: ", e)
            }
        })
        if (memoryMap.has(name)) {
            memoryMap.set(name, payload)
        }
    }

    function off<T extends EventName>(name: T, id: number) {
        if (!has(name)) return
        const ind = events[name].findIndex(e => e.id === id)
        if (ind > -1) {
            events[name].splice(ind, 1)
        }
    }
    
    function has<T extends EventName>(name: T) {
        return name in events
    }

    function clear<T extends EventName>(name: T) {
        events[name] = []
        memoryMap.delete(name)
    }
    
    function last<T extends EventName>(name: T) {
        return memoryMap.get(name) || []
    }
})