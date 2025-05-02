<template>
    <div class="p-1 w-full h-full box-border flex-1 overflow-hidden flex">
        <TableDirectory :open="isMenuOpen" />
        <div class="rounded-lg bg-white w-full h-full overflow-hidden border-gray-300 border
            relative" ref="wrapper" v-resize-wrapper v-Cell-field-wrapper v-cell-selector-wrapper>
            <div class="w-full h-full overflow-auto" @scroll="handleScroll">
                <table class="[&_td,&_th:not(.sticky)]:relative">
                    <thead class=" outline-lef border-gray-300 sticky top-0 z-41 box-border">
                        <tr>
                            <!-- 左上角 -->
                            <t-cell th scope="col" rowspan="2" 
                                v-model:width="rowHeads.width" h-fixed class="h-20 sticky left-0 z-41">
                                <t-text-btn @click="setMenuOpen" :text="isMenuOpen ? '关闭' : '目录'" css=" text-black" />
                            </t-cell>
                            <!-- 第一行列标题 -->
                            <ColTh v-for="v in colHeads.list" :head="v" class="[&_.sub]:h-20"/>
                        </tr>
                        <tr>
                            <!-- 第二行列标题 -->
                            <ColTh v-for="v in colSubsInMain" :head="v.sub"/>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="row, rowIndex in body">
                            <tr>
                                <!-- 行标题 -->
                                <t-cell
                                    th scope="row" colspan="1" class="z-40 sticky left-0"
                                    v-model:text="rowHeads.list[rowIndex].text"
                                    v-model:width="rowHeads.width"
                                    :id="`${rowHeads.list[rowIndex].r}:${rowHeads.list[rowIndex].c}:${rowHeads.list[rowIndex].p}`"e
                                    @click.prevent="openTimer(rowIndex)"
                                    :css="timerId === rowIndex ? 'text-green-700' : ''"
                                />
                                <!-- 内容 -->
                                <t-cell
                                    v-for="cell, colIndex in row" :key="`${cell.r}:${cell.c}`"
                                    v-model:text="cell.text"
                                    v-model:width="colSubs[colIndex].width"
                                    :id="`${cell.r}:${cell.c}:${Math.min(rowHeads.list[rowIndex].p, colSubs[colIndex].p)}`"e
                                />
                            </tr>
                            <tr v-if="timerId === rowIndex">
                                <td :colspan="colHeads.cols + 1" class="border-b border-gray-300 relative">
                                    <div class="p-3 flex bor w-fit gap-3 sticky left-0">
                                        <t-icon-btn :icon="close" @click="closeTimer"/>
                                        <t-button v-show="!isTiming" text="开始计时" color="MediumSeaGreen" @click="startTiming"/>
                                        <t-button v-show="isTiming" text="结束计时" color="indianred"  @click="stopTiming"/>
                                        <div class="h-9 flex justify-center items-center bg-gray-100 px-8 rounded-md">
                                            {{ timerStr }}
                                        </div>
                                        <t-button v-show="isTiming && !isTimerPausd" text="暂停" color="goldenrod"  @click="pauseTiming"/>
                                        <t-button v-show="isTiming && isTimerPausd" text="继续" color="teal"  @click="keepTiming"/>
                                    </div>
                                    <div class="h-full border-r border-gray-300 absolute right-0 top-0"></div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import tCell from '@/components/t-cell.vue';
import tTextBtn from '@/components/t-text-btn.vue';
import tIconBtn from '@/components/t-icon-btn.vue';
import tButton from '@/components/t-button.vue';
import ColTh from '../views/ColTh.vue'
import useTable from '@/store/useTable';
import useCellField from '@/store/useCellField';
import useResize from '@/store/useResize';
import type { ColMainHead } from '@/models/table';
import { getHMSStr, getMSStr } from '@/util/timeStr';
import useCellSelector from '@/store/useCellSelector';
import { useBus } from '@/store/useBus';
import TableDirectory from './TableDirectory.vue';
import close from '@/assets/icons/close.png';

const { colHeads, rowHeads, body, colSubs, colSubsInMain, addDate, saveTable } = useTable()
const { vResizeWrapper } = useResize()
const { vCellFieldWrapper } = useCellField()
const { vCellSelectorWrapper } = useCellSelector()

const isMenuOpen = ref(false)
const bus = useBus()

function handleScroll() {
    bus.emit('globalClick', 'scroll')
}

function setMenuOpen() {
    isMenuOpen.value = !isMenuOpen.value
    bus.emit('globalClick', 'tableMenu')
}

const timerId = ref(-1)
const timerStr = ref('00:00')
const isTiming = ref(false)
const isTimerPausd = ref(false)
let intervalId = -1
let duration = 0
let subId = 0

function openTimer(id: number) {
    if (timerId.value > -1) {
        return
    }
    closeTimer()
    timerId.value = id
    bus.emit('globalClick', 'timer')
    bus.emit('setTimerState', 'ready')
    bus.on('updateTable', closeTimer, {once: true})
}

function closeTimer() {
    timerId.value = -1
    isTiming.value = false
    isTimerPausd.value = false
    timerStr.value = '00:00'
    duration = 0
    subId = 0
    clearInterval(intervalId)
    saveTable()
    bus.clear('updateTable')
    bus.emit('setTimerState', 'free')
}

function startTiming() {
    isTiming.value = true
    intervalId = setInterval(updateTimer, 1000)
    subId = addDate(timerId.value)
    body[timerId.value][(colHeads.list[1] as ColMainHead).list[subId].c - 1].text = getHMSStr()
    bus.emit('setTimerState', 'active')
}

function stopTiming() {
    const row = body[timerId.value]
    const subCol = (colHeads.list[1] as ColMainHead).list[subId].c
    row[subCol].text = getHMSStr()
    row[subCol + 1].text = timerStr.value
    closeTimer()
}

function pauseTiming() {
    isTimerPausd.value = true
    clearInterval(intervalId)
    bus.emit('setTimerState', 'ready')
}

function keepTiming() {
    isTimerPausd.value = false
    intervalId = setInterval(updateTimer, 1000)
    bus.emit('setTimerState', 'active')
}

function updateTimer() {
    timerStr.value = getMSStr(++duration)
}
</script>
<style>
.thinBar {
    scrollbar-width: thin; /* 设置滚动条宽度 */
}

.thinBar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
</style>