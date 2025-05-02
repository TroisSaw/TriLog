<template>
    <div class="h-full shrink-0 flex flex-col gap-1 overflow-x-hidden overflow-y-auto outline-0"
        style="transition: width .2s, opacity .2s;"
        :class="[open ? 'w-60 pr-1 opacity-100' : 'w-0 pr-0 opacity-0']"
        @click.stop="bus.emit('globalClick', 'directory')">

        <div class="text-sm text-gray-600 pl-4 pr-1 flex justify-between max-w-60">
            <div>表目录</div>
            <tIconBtn :icon="addTableIcon" css="!size-4 !mx-0" bg-css="group-hover/icon-btn:!bg-gray-300 !h-7 w-7" @click="addTable"/>
        </div>

        <div v-for="v, k in tableConfig.idList" class="rounded-md transition-colors duration-200 pl-4 pr-1 py-1 flex items-center
            cursor-pointer group/dir leading-7"
            :class="[tableConfig.selId === k ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-gray-300']"
            @click="handleClick(k)"    
        >
            <template v-if="isRename === k">
                <input type="text" class="text-md flex-1 overflow-hidden text-nowrap"
                    @keyup.enter="handleReName(k, $event)" @blur="handleReName(k, $event)"
                    v-rename="k">
            </template>
            <template v-else>
                <div class="text-md text-nowrap flex-1 overflow-hidden">{{v}}</div>
                <tIconBtn class="group-hover/dir:opacity-100 opacity-0 transition-opacity duration-200"
                    :icon="editIcon" css="!size-4 !mx-0" bg-css="group-hover/icon-btn:!bg-gray-200 !h-7 w-7"
                    @click.stop="isRename = k"/>
                <tIconBtn class="group-hover/dir:opacity-100 opacity-0 transition-opacity duration-200"
                    :icon="deleteIcon" css="!size-4 !mx-0" bg-css="group-hover/icon-btn:!bg-[#e81123] !h-7 w-7"
                    @click.stop="deleteTable(k)"/>
            </template>
        </div>
    </div>
</template>
<script setup lang="ts">
import tIconBtn from '@/components/t-icon-btn.vue';
import { useBus } from '@/store/useBus';
import useTable from '@/store/useTable';
import { ref, type Directive } from 'vue';
import addTableIcon from '@/assets/icons/add_table.png';
import deleteIcon from '@/assets/icons/delete.png';
import editIcon from '@/assets/icons/edit.png';

const props = defineProps<{
    open: boolean
}>()

const { tableConfig, addTable, deleteTable, openTable, reNameTable } = useTable()

function handleClick(id: number) {
    openTable(id)
}

const isRename = ref(-1)
const vRename: Directive = {
    mounted(el: HTMLInputElement, binding) {
        el.value = tableConfig.idList[binding.value as number]
        el.focus()
    }
}
function handleReName(id: number, e: KeyboardEvent|FocusEvent) {
    reNameTable(id, (e.target as HTMLInputElement).value)
    isRename.value = -1
}

const bus = useBus()
</script>
<style lang="">
</style>