export default function updateReactiveObj<T extends object>(target: T, source: T) {
    Object.keys(source).forEach(key => {
        const k = key as keyof T
        if (Array.isArray(source[k])) {
            // 处理数组类型的属性
            const targetArr = target[k] as unknown[]
            const sourceArr = source[k] as unknown[]
            targetArr.splice(0, targetArr.length, ...sourceArr)
        } else {
            // 处理普通属性
            target[k] = source[k]
        }
    })
}