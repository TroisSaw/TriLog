// import { resolveResource } from '@tauri-apps/api/path'
import { convertFileSrc } from '@tauri-apps/api/core'

export default function reqSrc(path: string) {
    const p = convertFileSrc(`/src/assets/${path}`)
    return p
}