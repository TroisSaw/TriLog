import { defineStore } from "pinia";
import { createVNode, ref, render, type Directive, type VNode } from "vue";

export default defineStore('useResize', () => {
    let isResizing = false
    let moveup: Function | null
    const wrapper = ref<HTMLElement | null>()
    let reLineVNode: VNode | null
    let reDirection: boolean
    
    const vResize: Directive = {
        mounted(el: HTMLElement, binding) {
            el.onmousedown = (e) => {
                e.preventDefault()
                e.stopPropagation()
                isResizing = true
                window.onmousemove = (e) => {
                    if (!isResizing) return
                    el.parentElement!.parentElement!.style.pointerEvents = 'none'
                    if (reLineVNode) {
                        const rect = wrapper.value!.getBoundingClientRect()
                        reDirection
                        ? reLineVNode.props!.style.top = `${e.clientY - rect.y - 2}px`
                        : reLineVNode.props!.style.left = `${e.clientX - rect.x - 2}px`
                    }
                    moveup = binding.value(e)
                } 
                window.onmouseup = () => {
                    el.parentElement!.parentElement!.style.pointerEvents = 'auto'
                    moveup && moveup()
                    isResizing = false
                    window.onmousemove = null
                    window.onmouseup = null
                    moveup = null
                }
            }

            el.onmouseenter = (e) => {
                e.preventDefault()
                e.stopPropagation()
                if (wrapper.value && !reLineVNode) {
                    const rect = wrapper.value.getBoundingClientRect()
                    reDirection = el.offsetHeight < 2
                    reLineVNode = createVNode('div', {
                        class: [
                            'bg-blue-400 absolute pointer-events-none select-none showReline opacity-0 z-60',
                            reDirection ? 'w-full h-1' : 'w-1 h-full'
                        ],
                        style: reDirection ? {
                            left: '0px',
                            top: `${e.clientY - rect.y - 2}px`,
                            // animation: 
                        } : {
                            left: `${e.clientX - rect.x - 2}px`,
                            top: '0px'
                        }
                    })
                    
                    const div = document.createElement('div')
                    wrapper.value.appendChild(div)
                    render(reLineVNode, div)
                }
            }
            el.onmouseleave = (e) => {
                if (reLineVNode) {
                    wrapper.value!.lastChild?.remove()
                    reLineVNode = null;
                }
            }
        },
        unmounted(el: HTMLElement) {
            isResizing = false
            window.onmousemove = null
            window.onmouseup = null
            moveup = null
            el.onmousedown = null
        }
    }

    const vResizeWrapper: Directive = {
        mounted: (el) => wrapper.value = el,
        unmounted: () => wrapper.value = null
    }

    return {
        vResize,
        vResizeWrapper
    }
})