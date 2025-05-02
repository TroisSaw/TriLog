<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import { open as jump } from '@tauri-apps/plugin-shell';
import { ref } from 'vue';
import tTextBtn from '@/components/t-text-btn.vue';
import tLogo from '@/components/t-logo.vue';
import { useBus } from '@/store/useBus';
import dismiss from '@/assets/icons/dismiss.png'
import dismiss_white from '@/assets/icons/dismiss-white.png'
import restore from '@/assets/icons/restore.png'
import maximize from '@/assets/icons/maximize.png'
import pin from '@/assets/icons/pin.png'
import pined from '@/assets/icons/pined.png'
import { writeFile, readTextFile } from '@tauri-apps/plugin-fs';
import { save, open, type DialogFilter } from '@tauri-apps/plugin-dialog';
import useTable from '@/store/useTable';
import { utils, write} from 'xlsx'
import { isTableData } from '@/models/table';
import { decrypt, encrypt } from '@/util/crypt';

const appWindow = getCurrentWindow()

const pinIcon = ref(pin)
const maximizeIcon = ref(maximize)
const dismissIcon = ref(dismiss)

function handleMaximize() {
    appWindow.toggleMaximize().then(() => {
        appWindow.isMaximized().then(v => {
            maximizeIcon.value = v? restore : maximize
        })
    })
}

const isPin = ref(false)
function togglePin() {
    isPin.value = !isPin.value
    pinIcon.value = isPin.value ? pined : pin
    appWindow.setAlwaysOnTop(isPin.value)
}

const isOpenFile = ref(false)
const bus = useBus()

bus.on('globalClick', (id) => {
    if (id !== 'openFile') {
        isOpenFile.value = false
    }
})

function openFile() {
    isOpenFile.value = !isOpenFile.value
}

const filter: DialogFilter = {
    name: '备份文件',
    extensions: ['bak'],
}

async function exportJSON() {
    const { getTable, tableConfig: tc } = useTable()
    try {
        const filePath = await save({
            filters: [filter],
            title: '导出备份',
            defaultPath: tc.idList[tc.selId]
        })
        if (filePath) {
            const content = encrypt(JSON.stringify(getTable()))
            const data = new TextEncoder().encode(content)
            await writeFile(filePath, data)
            alert('文件导出成功！')
        }
    } catch(e) {
        console.error(e)
    } finally {
        openFile()
    }
}

async function importJSON() {
    try {
        const filePath = await open({
            filters:[filter],
            title: '导入备份'
        })
        if (!filePath) {
            return
        }
        const content = decrypt(await readTextFile(filePath))
        console.log(content)
        const jsonData = JSON.parse(content)
        console.log(jsonData)

        if (!isTableData(jsonData)) {
            alert('无法解析该文件')
            return
        }
        const { pushTable } = useTable()
        const name = pushTable(jsonData)
        alert('已导入备份文件：' + name)
    } catch(e) {
        console.error(e)
        alert('无法解析该文件')
    } finally {
        openFile()
    }
}

interface Merge {
    s: { r: number, c: number}
    e: { r: number, c: number}
}

async function exportExcel() {
    const { getTable, tableConfig: tc } = useTable()
    try {
        const filePath = await save({
            filters: [{
                name: 'xlsx文件',
                extensions: ['xlsx']
            }],
            title: '导出 Excel',
            defaultPath: tc.idList[tc.selId]
        })
        if (filePath) {
            const mergeCells: Merge[] = [{
                s: { r: 0, c: 0 },
                e: { r: 1, c: 0 },
            }]
            // 第一行标题
            const mainHeaderRow: string[] = ['']
            // 第二行标题
            const subHeaderRow: string[] = ['']

            const table = getTable()
            table.colHeads.list.forEach((v) => {
                if (v.end) {
                    // 占 2 行 1 列的标题
                    mainHeaderRow.push(v.text)
                    subHeaderRow.push('')
                    const startCol = mainHeaderRow.length - 1
                    mergeCells.push({ s: { r: 0, c: startCol }, e: { r: 1, c: startCol } })
                } else {
                    // 占 1 行 v.list.length 列
                    mainHeaderRow.push(v.text)
                    const startCol = mainHeaderRow.length - 1
                    const endCol = startCol + v.list.length - 1
                    mergeCells.push({ s: { r: 0, c: startCol }, e: { r: 0, c: endCol } })
                    // 占 1 行 1 列
                    v.list.forEach((vv, kk) => {
                        if (kk) {
                            mainHeaderRow.push('')
                        }
                        subHeaderRow.push(vv.text)
                    })
                }
            })
            const bodyData = table.rowHeads.list.map((v, k) => {
                return [v.text].concat(table.body[k].map(vv => vv.text))
            })
            // 合并表头和表身
            const worksheetData = [mainHeaderRow, subHeaderRow, ...bodyData]
            // 创建一个新的工作簿
            const workbookm = utils.book_new()
            // 创建工作表
            const worksheet = utils.aoa_to_sheet(worksheetData)
            // 设置合并单元格
            worksheet['!merges'] = mergeCells
            // 将工作表添加到工作簿
            utils.book_append_sheet(workbookm, worksheet, 'Sheet1')
            const xlsxData = write(workbookm, { type: 'buffer' })
            await writeFile(filePath, xlsxData)
            alert('导出Excel成功！')
        }
    } catch(e) {
        console.error(e)
    } finally {
        openFile()
    }

}

const isReady = ref(false)
const isAtive = ref(false)

bus.on('setTimerState', (s) => {
    if (s === 'free') {
        isReady.value = isAtive.value = false
    } else if (s === 'ready') {
        isReady.value = true
        isAtive.value = false
    } else  {
        isReady.value = isAtive.value = true
    }
})
</script>

<template>
    <div class="w-full flex pl-1 gap-1 select-none" data-tauri-drag-region>
        <div class="flex flex-1 justify-start items-center shrink-0 pt-1 gap-1" data-tauri-drag-region>
            <t-logo v-if="isReady" :is-ative="isAtive" class="size-5"/>
            <img v-else src="../assets/logo.png" class="size-5">
            <t-text-btn text="文件" css="!text-sm font-semibold !px-2" :bg-css="isOpenFile ? '!h-6 !bg-gray-200' : '!h-6'"
                @click="openFile"/>
            <div v-show="isOpenFile" class="absolute top-7 left-7 z-70 bg-white border border-gray-300 shadow-md rounded-md p-1 text-sm
                flex flex-col min-w-39">
                <div class="px-2 py-1 rounded-sm hover:bg-green-600 hover:text-white cursor-pointer"
                    @click="importJSON">导入备份</div>
                <div class="px-2 py-1 rounded-sm hover:bg-green-600 hover:text-white cursor-pointer"
                    @click="exportJSON">导出备份</div>
                <div class="px-2 py-1 rounded-sm hover:bg-green-600 hover:text-white cursor-pointer"
                    @click="exportExcel">导出 Excel</div>
                <div class="relative w-[calc(100%-.5rem)] mx-1 my-1 border-b border-gray-300"></div>
                <div class="px-2 py-1 rounded-sm hover:bg-green-600 hover:text-white cursor-pointer"
                    @click="appWindow.close">退出 TriLog</div>
            </div>
            <t-text-btn text="关于" css="!text-sm font-semibold !px-2" bg-css="!h-6" @click="jump('https://github.com/TroisSaw/TriLog')"/>
            <!-- <div class="absolute top-7 left-15 z-70 bg-red-700 p-10"></div> -->
        </div>
        <div class="flex-1 flex justify-center text-sm text-black font-bold align-middle leading-6 pt-1" data-tauri-drag-region>TriLog</div>
        <div class="flex flex-1 shrink-0 justify-end"  data-tauri-drag-region>
            <div class="transition-colors duration-200 bg-transparent hover:bg-gray-200
                w-11 flex justify-center items-center" @click="togglePin">
                <img :src="pinIcon" class="size-4" draggable="false">
            </div>
            <div class="transition-colors duration-200 bg-transparent hover:bg-gray-200
                w-11 flex justify-center items-center" @click="appWindow.minimize">
                <img src="../assets/icons/minimize.png" class="size-4" draggable="false">
            </div>
            <div class="transition-colors duration-200 bg-transparent hover:bg-gray-200
                w-11 flex justify-center items-center" @click="handleMaximize">
                <img :src="maximizeIcon" class="size-4" draggable="false">
            </div>
            <div class="transition-colors duration-200 bg-transparent hover:bg-[#e81123]
                w-11 flex justify-center items-center" @click="appWindow.close"
                @mouseenter="dismissIcon = dismiss_white" @mouseleave="dismissIcon = dismiss">
                <img :src="dismissIcon" class="size-4" draggable="false">
            </div>
        </div>
    </div>
</template>

<style scoped></style>
