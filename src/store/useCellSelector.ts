import { defineStore } from "pinia"
import { createVNode, ref, render, type Directive } from "vue"
import tSelector from "@/components/t-selector.vue"
import { useBus } from "./useBus"

export default defineStore('useCellSelector', () => {
    const wrapper = ref<HTMLElement | null>(null)
    const selector = ref<HTMLElement | null>(null)
    let instance: any = {}
    
    const bus = useBus()

    const vCellSelectorWrapper: Directive = {
        mounted: (el) => {
            wrapper.value = el
            el.onclick = () => {
                bus.emit('globalClick', 'cancelClick')
                if (selector.value) {
                    instance.close()
                }
            }
        },
        unmounted: (el) => el.onclick = wrapper.value = null
    }

    const createSelectorVNode = () => {
        const selectorVNode = createVNode(tSelector)
        selectorVNode.props = {
            onMounted: (dom: HTMLElement, fns: any) => {
                selector.value = dom,
                instance = fns
            },
        }
        const div = document.createElement('div')
        wrapper.value?.appendChild(div)
        render(selectorVNode, div)
    }

    bus.on('globalClick', (id) => {
        if (id !== 'cellSelector' && id !== 'cellMenu' && selector.value) {
            instance.close()
        }
    })

    return {
        vCellSelectorWrapper,
        showSelector,
    }

    function showSelector(rect: DOMRect) {
        if (wrapper.value) {
            bus.emit('globalClick', 'cellSelector')
            if (!selector.value) createSelectorVNode()
            const wrapperRect = wrapper.value.getBoundingClientRect()
            selector.value!.style.left = rect.x - wrapperRect.x + 'px'
            selector.value!.style.top = rect.y - wrapperRect.y + 'px'
            selector.value!.style.width = rect.width + 'px'
            selector.value!.style.height = rect.height + 'px'
            instance.show()
        }
    }
})