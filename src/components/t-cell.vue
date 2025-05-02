<template>
    <component
        :is="th? 'th' : 'td'" ref="cell"
        @dblclick.stop="handleDblClick"
        @click.stop="handleClick"
        @contextmenu.prevent="handleRightClick"
        :class="['bg-white']"
        draggable="false"
        :id="id"
        v-cell-field
    >
        <div class="box-border min-h-10 flex items-center" draggable="false">
            <div class=" flex items-center px-2 pointer-events-none"
                :style="{
                    width: width ? (width + 'px') : '100%',
                    height: height ? (height + 'px') : '100%',
                    justifyContent: rh ? 'start' : 'center'
                }"
            >
                <slot :text="text">
                    <div class="relative z-30 whitespace-nowrap line-clamp-1
                        empty:before:content-['a'] empty:before:text-transparent empty:before:block empty:before:select-none"
                        :class="{'text-transparent': isShowField, [css!]: css}"
                    >{{ text }}</div>
                </slot>
                
                <div v-if="!wFixed" v-resize="handleReWidth" @click.stop
                    class="hover:cursor-ew-resize h-full w-px border-r border-gray-300 absolute right-0 top-0 pointer-events-auto"
                ></div>
                <div
                    class="w-full h-px border-b border-gray-300 absolute left-0 bottom-0 pointer-events-auto"
                ></div>
            </div>
        </div>
    </component>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import useTable from '@/store/useTable';
import useCellField from '@/store/useCellField';
import useResize from '@/store/useResize';
import useCellMenu from '@/store/useCellMenu';
import type { EquipItem, MenuItem } from '@/models/menu';
import useCellSelector from '@/store/useCellSelector';

const props = defineProps<{
    text?: string
    wFixed?: boolean
    hFixed?: boolean
    width?: number
    height?: number
    th?: boolean
    id?: string
    css?: string
}>()

const emit = defineEmits<{
    'update:text': [string]
    'update:width': [number]
    'update:height': [number]
}>()

const cell = ref<HTMLElement>()
const { saveTable, rowHeads, colSubs, deleteCol, deleteRow, addRow, addCol } = useTable()
const { vResize } = useResize()
const { showField, vCellField } = useCellField()
const { showMenu } = useCellMenu()
const { showSelector } = useCellSelector()

const equipItem: EquipItem[] = [
    {
        text: '编辑',
        test: (r, c, p) => p > 0,
        fn: handleDblClick
    },
    {
        text: '计时',
        test: (r, c, p) => c === 0,
        fn: () => cell.value?.click()
    },
    {
        text: '删除行',
        test: (r, c, p) => r > 1 && rowHeads.rows > 1,
        fn: (r) => { deleteRow(r! - 2); saveTable() }
    },
    {
        text: '删除列',
        test: (r, c, p) => c > 0 && colSubs.find(v => v.c === c)!.p > 0,
        fn: (r, c) => { deleteCol(c!); saveTable() }
    },
    {
        text: '插入行',
        test: (r, c, p) => r > 1,
        fn: (r) => { addRow(r! - 1); saveTable() }
    },
    {
        text: '插入列',
        test: (r, c, p) => r > 0 && c > 3,
        fn: (r, c) => { addCol(c! + 1); saveTable() }
    },
]

const isInBody = computed(() => props.text !== undefined && props.id && /\d+:\d+:\d+/.test(props.id))
const rcp = computed(() => props.id?.split(':').map(Number))
const menuItems = computed(() => {
    const [r, c, p] = rcp.value!
    return equipItem
        .filter(v => v.test(r, c, p))
        .reduce((pre, v) => {
            pre[v.text] = () => v.fn(r, c, p)
            return pre
        }, {} as MenuItem)
})
const rh = computed(() => {
    const rc = rcp.value
    return rc && rc[0] && !rc[1]
})

function handleClick() {
    if (isInBody.value) {
        const rect = cell.value!.getBoundingClientRect()
        showSelector(rect)
    }
}

const isShowField = ref(false)
function handleDblClick() {
    if (isInBody && props.id && parseInt(props.id.split(':')[2]) > 0) {
        showField(
            cell.value!, props.text!,
            (s: string) => {
                emit('update:text', s)
                saveTable()
            },
            () => isShowField.value = false
        )
        isShowField.value = true
    }
}


function handleRightClick(e: MouseEvent) {
    if (isInBody.value) {
        const rect = cell.value!.getBoundingClientRect()
        showSelector(rect)
        showMenu(e.clientX, e.clientY, menuItems.value, rect)
    }
}

function handleReWidth(e: MouseEvent) {
    const rect = cell.value!.getBoundingClientRect()
    emit('update:width', Math.max(100, e.clientX - rect.x))
    return saveTable
}

</script>
<style lang="">
    
</style>