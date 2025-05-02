import { defineStore } from "pinia"
import { createVNode, nextTick, ref, render, type Directive } from "vue"
import tMenu from "@/components/t-menu.vue"
import type { MenuItem } from "@/models/menu"
import { useBus } from "./useBus"

export default defineStore('useCellMenu', () => {
    const wrapper = ref<HTMLElement | null>(null)
    const menu = ref<HTMLElement | null>(null)
    let instance: any = {}

    const bus = useBus()

    const vCellMenuWrapper: Directive = {
        mounted: (el) => {
            wrapper.value = el
            el.onclick = () => {
                if (menu.value) {
                    instance.close()
                }
            }
        },
        unmounted: (el) => el.onclick = wrapper.value = null
    }

    const createMenuVNode = () => {
        const menuVNode = createVNode(tMenu)
        menuVNode.props = {
            onMounted: (dom: HTMLElement, fns: any) => {
                menu.value = dom,
                instance = fns
            },
        }
        const div = document.createElement('div')
        wrapper.value?.appendChild(div)
        render(menuVNode, div)
    }

    bus.on('globalClick', (id) => {
        if (id !== 'cellMenu' && menu.value) instance.close()
    })

    return {
        vCellMenuWrapper,
        showMenu,
    }

    function showMenu(x: number, y: number, items: MenuItem, rect: DOMRect) {
        if (wrapper.value) {
            bus.emit('globalClick', 'cellMenu')
            if (!menu.value) createMenuVNode()
            const dom = menu.value
            instance.setItems(items)
            instance.show()
            nextTick(() => {
                const menuRect = dom!.getBoundingClientRect()
                dom!.style.left = Math.min(x + 20, rect.x + rect.width, window.innerWidth - menuRect.width) + 'px'
                dom!.style.top = Math.min(y + 10, rect.y + rect.height, window.innerHeight - menuRect.height) + 'px'
            })
        }
    }
})