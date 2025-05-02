import { defineStore } from "pinia"
import { createVNode, nextTick, ref, render, type Directive } from "vue"
import tField from "@/components/t-field.vue"
import useTable from "@/store/useTable"
import { useBus } from "./useBus"

type FindFn = (id: string)=>Promise<string>

export default defineStore('useCellField', () => {
    const wrapper = ref<HTMLElement | null>(null)
    const field = ref<HTMLElement | null>(null)
    let lastCloseEffert: Function | null = null
    const cellGrid: Record<string, HTMLElement> = {}
    const { rowHeads, colHeads, addRow, addCol, colSubsInMain, colSubs } = useTable()
    const bus = useBus()

    const vCellFieldWrapper: Directive = {
        mounted: (el) => wrapper.value = el,
        unmounted: (el) => wrapper.value = null
    }

    const vCellField: Directive = {
        mounted: (el: HTMLElement) => {
            cellGrid[(el.id as string).replace(/:\d+$/, '')] = el
        },
        unmounted: (el) => delete cellGrid[(el.id as string).replace(/:\d+$/, '')]
    }

    const alignView = (cell: HTMLElement) => {
        const scrollView = wrapper.value!.firstElementChild!
        const scrollRect = scrollView.getBoundingClientRect()
        const cellRect = cell.getBoundingClientRect()
        const diffTop = cellRect.top - scrollRect.top
        const diffBottom = cellRect.bottom - scrollRect.bottom
        const diffLeft = cellRect.left - scrollRect.left
        const diffRight = cellRect.right - scrollRect.right
        if (diffTop < 110) {
            scrollView.scrollTop += diffTop - 130
        } else if (diffBottom > -20) {
            scrollView.scrollTop += diffBottom + 40
        }
        if (diffLeft < 20 + rowHeads.width) {
            scrollView.scrollLeft += diffLeft - 40 - rowHeads.width
        } else if (diffRight > -20) {
            scrollView.scrollLeft += diffRight + 40
        }
    }

    const showNewField = (id: string) => {
        if (id) {
            alignView(cellGrid[id])
            cellGrid[id].dispatchEvent(new MouseEvent('dblclick', {
                bubbles: false,
                buttons: 1
            }))
        }
    }

    const cutId = (id: string) => {
        return id.split(':').map(Number)
    }

    const checkP = async (id: string, fn: FindFn, isWait = false): Promise<string> => {
        if (isWait) {
            await new Promise<void>((resolve) => {
                nextTick(()=>resolve())
            })
        }
        return Object.keys(cellGrid).includes(id)
                ? cutId(cellGrid[id].id)[2] > 0 ? id : fn(id)
                : ''
    }

    const onClose = (closeEffert?: Function) => {
        wrapper.value?.lastChild?.remove()
        field.value = null
        if (closeEffert) closeEffert()
        else if (lastCloseEffert) lastCloseEffert()
    }

    const createFieldVNode = (cell: HTMLElement, value: string, update: Function, closeEffert?: Function) => {
        const fieldVNode = createVNode(tField)
        fieldVNode.props = {
            value: value,
            onMounted: (cell: HTMLElement) => field.value = cell,
            onUpdate: (value: string) => update(value),
            onClose: () => onClose(closeEffert),
            onUp: async () => {
                const findUpId: FindFn = (id) => {
                    const [r, c] = cutId(id)
                    let subIndex
                    if (r === 1 && (subIndex = colSubsInMain.findIndex(v => v.sub.c === c)) > -1) {
                        id = `0:${colSubsInMain[subIndex].mainC}`
                    } else if (r > 1) {
                        id = `${r - 1}:${c}`
                    } else id = ''
                    return checkP(id, findUpId)
                }
                showNewField(await findUpId(cell.id))
            },
            onDown: async () => {
                const findDownId: FindFn = (id) => {
                    const [r, c] = cutId(id)
                    let isWait = false
                    if(r === rowHeads.rows + 1){
                        addRow(r - 1)
                        isWait = true
                    }
                    id = `${r + 1}:${c}`
                    return checkP(id, findDownId, isWait)
                }
                showNewField(await findDownId(cell.id))
                
            },
            onLeft: async () => {
                const findLeftId: FindFn = (id) => {
                    const [r, c] = cutId(id)
                    id = ''
                    if (r === 0) {
                        const mainIndex = colHeads.list.findIndex(v => v.c === c)
                        if (mainIndex > 0) {
                            const nextHead = colHeads.list[mainIndex - 1]
                            id = `${nextHead.r}:${nextHead.c}`
                        }
                    }
                    id = id || `${r}:${c - 1}`
                    return checkP(id, findLeftId)
                }
                showNewField(await findLeftId(cell.id))
            },
            onRight: async () => {
                const findRightId: FindFn = (id) => {
                    const [r, c] = cutId(id)
                    id = ''
                    let isWait = false
                    if (r === 0) {
                        const mainIndex = colHeads.list.findIndex(v => v.c === c)
                        if (mainIndex < colHeads.list.length - 1) {
                            const nextHead = colHeads.list[mainIndex + 1]
                            id = `${nextHead.r}:${nextHead.c}`
                        }
                    } else if(c === colHeads.cols){
                        addCol(c + 1)
                        isWait = true
                    }
                    id = id || `${r}:${c + 1}`
                    return checkP(id, findRightId, isWait)
                }
                showNewField(await findRightId(cell.id))
            }
        }
        const div = document.createElement('div')
        wrapper.value?.appendChild(div)
        render(fieldVNode, div)
    }

    bus.on('globalClick', (id) => {
        if (id !== 'cellField' && id !== 'scroll' && field.value) onClose()
    })

    return {
        vCellFieldWrapper,
        vCellField,
        showField
    }

    function showField(cell: HTMLElement, value: string, update: Function, closeEffert?: Function) {
        if (wrapper.value) {
            bus.emit('globalClick', 'cellField')
            if (field.value) {
                onClose()
            }
            lastCloseEffert = closeEffert || null
            createFieldVNode(cell, value, update, closeEffert)
            const cellRect = cell.getBoundingClientRect()
            const wrapperRect = wrapper.value.getBoundingClientRect()
            field.value!.style.left = cellRect.x - wrapperRect.x -1 + 'px'
            field.value!.style.top = cellRect.y - wrapperRect.y + 40 + 'px'
            field.value!.style.minWidth = cellRect.width + 'px'
            field.value!.style.minHeight = cellRect.height + 'px'
        }
    }
})