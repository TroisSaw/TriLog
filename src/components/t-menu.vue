<template>
    <div
        @click.stop
        ref="menu"
        class="fixed z-90 overflow-hidden rounded-md shrink-0 border border-gray-300
            min-h-11 bg-gray-50 font-normal shadow-lg"
        v-show="isShow"     
    >

        <div class="flex flex-col p-1 relative h-full items-start pointer-events-auto">
            <t-text-btn text="关闭" css="text-sm" bg-css="!bg-gray-50" @click="close"/>
            <t-text-btn v-for="v, k in menuItems"  bg-css="!bg-gray-50" :text="k as string" css="text-sm" @click="() => {v(); close()}"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import tTextBtn from './t-text-btn.vue';
import type { MenuItem } from '@/models/menu';

const emit = defineEmits<{
    mounted: [HTMLElement, typeof exposeFn]
}>()

const menu = ref()

const isShow = ref(false)

function show() {
    isShow.value = true
}

function close() {
    isShow.value = false
}

const menuItems: MenuItem = reactive({})

function setItems(items: MenuItem) {
    for (const key in menuItems) {
        delete menuItems[key]
    }
    Object.assign(menuItems, items)
}

const exposeFn = {
    show,
    close,
    setItems,
}

onMounted(() => {
    emit('mounted', menu.value, exposeFn)
})

</script>