<template>
    <div
        ref="fieldRoot"
        class="absolute border-gray-400 border z-50 overflow-hidden rounded-md rounded-l-none shrink-0
            min-h-10"
        style="background: linear-gradient(to right, #fff, #fffb);"
        @click.stop>

        <div class="flex gap-1 px-1 relative z-20 items-center h-full"
        >
            <div
                class="
                    min-w-10 min-h-10 flex-1 shrink-0 leading-10
                    outline-0 break-all break-words whitespace-pre-wrap
                    empty:before:content[''] empty:before:block empty:before:pointer-events-none"
                ref="field"
                contenteditable="plaintext-only"
                @focus="onFocus"
                @input="onInput"
                @keydown="onKeydown"
                @blur="onBlur"
             >
            </div>
            <t-icon-btn :icon="confirm" @click.stop="onClose"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import tIconBtn from '../components/t-icon-btn.vue'
import confirm from '@/assets/icons/confirm.png'
const props = defineProps<{
    value: string
}>()

const emit = defineEmits<{
    update: [string]
    close: []
    down: []
    up: []
    left: []
    right: []
    mounted: [HTMLElement]
}>()

const fieldRoot = ref()
const field = ref()

onMounted(() => {
    const dom = field.value
    dom.textContent = props.value
    dom.focus();
    
    if (dom) {
        const range = document.createRange();
        const selection = window.getSelection();

        // 创建一个范围，覆盖整个内容
        range.setStart(dom.firstChild || dom, dom.textContent?.length || 0);
        range.collapse(true); // 折叠范围到末尾

        // 应用范围到当前选择
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    emit('mounted', fieldRoot.value)
})

function onClose() {
    emit('close')
}


function onBlur() {
    window.onpaste = null
}

function onInput() {
    emit('update', field.value.textContent = field.value.textContent.trim())
    if (field.value.textContent === '\n') {
        field.value.textContent = "";
    }
}

function onFocus() {
    window.onpaste = onPaste
}

function onKeydown(e: KeyboardEvent) {
    switch (e.key) {
        case 'Enter': {
            e.preventDefault();
            if (e.ctrlKey) onClose()
            else if (e.shiftKey) emit('up')
            else emit('down')
            break
        }
        case 'Tab': {
            e.preventDefault()
            if (e.shiftKey) emit('left')
            else emit('right')
            break
        }
    }
}

//粘贴事件
function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const paste = (e.clipboardData || (window as any).clipboardData).getData('text/plain');
    var newNode = document.createTextNode(paste);
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0);
    // 删除当前选中的内容（如果有）
    if (!range.collapsed) {
        range.deleteContents();
    }
    // 在当前光标位置插入新节点
    range.insertNode(newNode);
    // 将光标移动到新节点的末尾
    range.setStartAfter(newNode);
    range.collapse(true);
    // 更新selection状态
    selection.removeAllRanges();
    selection.addRange(range);
    // 更新组件变量
    onInput();
}

//模拟按键
function mockKeyDown(code: number) {
    field.value.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true, cancelable: true, keyCode: code
    }));
}
</script>
<style>
</style>