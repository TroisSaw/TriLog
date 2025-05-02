import { initTableList, type ColMainHead, type ColSubHead, type ColSubHeadInMain, type TableList, type TableData, type ColHeads, type RowHeads, type Cell } from "@/models/table";
import { getMSStr, getTodayStr, parseMS } from "@/util/timeStr";
import updateReactiveObj from "@/util/updateReactiveObj";
import { defineStore } from "pinia";
import { reactive, ref, watchEffect, type Directive } from "vue";
import { useBus } from "./useBus";

export default defineStore('useTable', () => {
    const tables_json = localStorage.getItem('tables')
    const tableList = reactive<TableList>(tables_json ? 
        JSON.parse(tables_json) : 
        structuredClone(initTableList)
    )

    const colHeads = reactive<ColHeads>({ cols: 0, list: [] })
    const rowHeads = reactive<RowHeads>({ rows: 0, width: 0, list: [] })
    const body = reactive<Cell[][]>([])
    const tableConfig = reactive(tableList.config)
    openTable(tableList.config.selId)

    const colSubsInMain: ColSubHeadInMain[] = reactive([])
    const colSubs: ColSubHead[] = reactive([])
    
    watchEffect(() => {
        colSubsInMain.splice(0, colSubsInMain.length,
                ...colHeads.list.flatMap(v => v.end? [] : v.list.map(vv => ({mainC: v.c, sub: vv}))))
        colSubs.splice(0, colSubs.length,
                ...colHeads.list.filter(v => v.end)
                .concat(colSubsInMain.map(v => v.sub))
                .sort((a, b) => a.c - b.c)
        )
    })

    watchEffect(() => {
        const logSub = colSubs.filter(v => v.p === 1 && v.text === '用时')
        if (!logSub.length) return
        body.forEach((row) => {
            const times = logSub.map(v => {
                const text = row[v.c - 1].text
                return/\d+:\d+/.test(text) ? parseMS(text) : 0
            })
            const { max, min, total, avg } = calculateTimeStats(times)
            row[0].text = max
            row[1].text = min
            row[2].text = avg
            row[3].text = total
        })
    })

    function calculateTimeStats(times: number[]) {
        let max = NaN
        let min = NaN
        let total = 0
        let validCount = 0
        times.forEach(time => {
            if (time) {
                if (isNaN(max) || time > max) max = time
                if (isNaN(min) || time < min) min = time
                total += time
                validCount++
            }
        })
        return {
            min: isNaN(min) ? '' : getMSStr(min),
            max: isNaN(max) ? '' : getMSStr(max),
            total: total ? getMSStr(total): '',
            avg: validCount ? getMSStr(total / validCount) : ''
        }
    }

    function fillBody() {
        const {rows} = rowHeads
        const {cols} = colHeads
        body.length = rows
        for (let r = 0; r < rows; r++) {
            body[r] = body[r] || []
            body[r].length = cols
            for (let c = 0; c < cols; c++) {
                body[r][c] = body[r][c] || { text: '', r: r + 2, c: c + 1 }
            }
        }
    }

    function addTableName() {
        let i = tableConfig.idList.length + 1
        while(tableConfig.idList.some(v => v === 'sheet' + i))
            i++
        return 'sheet' + i
    }

    function fixColHead() {
        colHeads.list.forEach(v => {
            if (!v.end) {
                v.c = v.list[0].c
            }
        })
    }

    const wrapper = ref<HTMLElement|null>(null)
    
    const vTableWrapper: Directive = {
        mounted: (el) => wrapper.value = el,
        unmounted: () => wrapper.value = null
    }

    fillBody()

    return {
        colHeads,
        rowHeads,
        body,
        colSubsInMain,
        colSubs,
        vTableWrapper,
        tableConfig,
        getTable,
        pushTable,
        addTable,
        deleteTable,
        reNameTable,
        openTable,
        saveTable: saveTable.bind(this),
        addRow,
        addCol,
        deleteRow,
        deleteCol,
        addDate,
    }

    function getTable(): TableData {
        return {
            colHeads: colHeads,
            rowHeads: rowHeads,
            body: body,
            name: tableConfig.idList[tableConfig.selId]
        }
    }

    function pushTable(newTable: TableData) {
        if (tableConfig.idList.some(v => v === newTable.name)) {
            newTable.name += '（新）'
        } else if (!newTable.name) {
            newTable.name = addTableName()
        }
        tableConfig.idList.push(newTable.name)
        tableList.list.push(newTable)
        return newTable.name
    }

    function addTable() {
        const newTable: TableData = JSON.parse(JSON.stringify(initTableList.list[0]))
        newTable.name = addTableName()
        tableConfig.idList.push(newTable.name)
        tableList.list.push(newTable)
        saveTable()
    }

    function deleteTable(id: number) {
        tableConfig.idList.splice(id, 1)
        tableList.list.splice(id, 1)
        if (!tableList.list.length) {
            addTable()
        }
        if (id === tableConfig.selId) {
            id = Math.max(0, Math.min(id, tableList.list.length - 1))
            openTable(id)
        } else {
            saveTable()
        }
    }

    function reNameTable(id: number, name: string) {
        tableConfig.idList[id] = name
        tableList.list[id].name = name
        saveTable()
    }

    function openTable(id: number) {
        const validId = Math.max(0, Math.min(id, tableList.list.length - 1))
        tableList.config.selId = validId
        
        const newTable = tableList.list[validId] || initTableList.list[0]

        updateReactiveObj(colHeads, newTable.colHeads)
        updateReactiveObj(rowHeads, newTable.rowHeads)
        body.splice(0, body.length)
        newTable.body.forEach(row => {
            body.push(row.map(cell => ({ ...cell })))
        })

        const { emit } = useBus()
        emit('updateTable')
        fixColHead()
        fillBody()
        saveTable()
    }

    function saveTable() {
        const currentTable = tableList.list[tableConfig.selId]
        if (currentTable) {
            updateReactiveObj(currentTable.colHeads, colHeads)
            updateReactiveObj(currentTable.rowHeads, rowHeads)
            currentTable.body.splice(0, currentTable.body.length)
            body.forEach(row => {
                currentTable!.body.push(row.map(cell => ({ ...cell })))
            })
            localStorage.setItem('tables', JSON.stringify(tableList))
        }
    }

    function addRow(rowId: number) {
        body.splice(rowId, 0, [])
        rowHeads.rows++
        rowHeads.list.splice(rowId, 0, {
            text: '',
            r: rowId + 2,
            c: 0,
            p: 2,
        })
        for (let k = rowId + 1; k < body.length; k++) {
            body[k].forEach(cell => {
                cell.r++
            })
            rowHeads.list[k].r++
        }
        fillBody()
    }
    
    function addCol(colId: number, p: 0|1|2 = 2) {
        for (const col of colHeads.list) {
            if (col.end && col.c >= colId) col.c++
            if (!col.end) {
                if (col.c >= colId) col.c ++
                col.list.forEach(v => v.c >=colId ? v.c++ : 0)
            }
        }
        // 逻辑列坐标
        const newSub: ColSubHead = {
            text: "",
            r: 1,
            c: colId,
            end: true,
            width: 100,
            p: p
        }
        const leftMainC = colSubsInMain.find(v => v.sub.c + 1 === colId)?.mainC
        if (leftMainC && leftMainC > -1) {
            //  如果左侧的列标题有main标题
            const leftMainIndex = colHeads.list.findIndex(v => v.c === leftMainC)
            const leftMain = colHeads.list[leftMainIndex] as ColMainHead
            const index = leftMain.list.findIndex(v => v.c + 1 === colId)
            if (index === leftMain.list.length - 1) {
                // 如果左侧的列标题是main标题里的最后一个
                colHeads.list.splice(leftMainIndex + 1, 0, newSub)
            } else {
                // 左侧的列标题不是main标题里的最后一个
                leftMain.list.splice(index + 1, 0, newSub)
            }
        } else {
            //  如果左侧的列标题没有main标题
            const index = colHeads.list.findIndex(v => v.c + 1 === colId)
            colHeads.list.splice(index + 1, 0, newSub)
        }
        colHeads.cols++
        body.forEach((row, ri) => {
            row.splice(colId - 1, 0, {
                text: "",
                r: ri + 2,
                c: colId - 1,
            })
            for (let k = colId - 1; k < row.length; k++) {
                row[k].c++
            }
        })
        fillBody()
    }

    function deleteRow(rowIndex: number) {
        body.splice(rowIndex, 1)
        rowHeads.rows--
        rowHeads.list.splice(rowIndex, 1)
        for (let k = rowIndex; k < body.length; k++) {
            body[k].forEach(cell => {
                cell.r--
            })
            rowHeads.list[k].r--
        }
    }
    
    function deleteCol(targetC: number) {
        let found = false
        outer: for (let i = 0; i < colHeads.list.length; i++) {
            const col = colHeads.list[i]
            if (col.end) {
                if (col.c === targetC) {
                    colHeads.list.splice(i, 1)
                    found = true
                    break
                }
            } else {
                for (let j = 0; j < col.list.length; j++) {
                    if (col.list[j].c === targetC) {
                        col.list.splice(j, 1)
                        found = true
                        if (col.list.length === 0) {
                            colHeads.list.splice(i, 1)
                        }
                        break outer
                    }
                }
            }
        }
    
        if (!found) return
        colHeads.list.forEach(col => {
            if (col.end) {
                if (col.c > targetC) col.c--
            } else {
                if (col.c > targetC) col.c--
                col.list.forEach(sub => {
                    if (sub.c > targetC) sub.c--
                })
            }
        })
        colHeads.cols--
        body.forEach(row => {
            const index = row.findIndex(cell => cell.c === targetC)
            if (index > -1) row.splice(index, 1)
            row.forEach(cell => {
                if (cell.c > targetC) cell.c--
            })
        })
        fillBody()
    }

    function addDate(rowIndex: number) {
        const todayStr = getTodayStr()
        const subs = [ '开始时间', '结束时间', '用时' ]
        if (!colHeads.list[1] || !colHeads.list[1].text || colHeads.list[1].text !== todayStr) {
            [0, 1, 2].forEach(v => addCol(5 + v, 1))
            colHeads.list.splice(1, 3, {
                end: false,
                text: todayStr,
                r: 0,
                c: 5,
                p: 0,
                list: colHeads.list.slice(1, 4).map((v, k) => {
                    v.text = subs[k]
                    return v
                }) as ColSubHead[]
            })
        }
        const mainHead = colHeads.list[1] as ColMainHead
        let subIndex = -1
        for (let i = mainHead.list.length - 3; i > -1; i --) {
            if (subs.every((v, k) => mainHead.list[i + k].text === v)  && !body[rowIndex][mainHead.list[i].c - 1]?.text) {
                subIndex = i
                break
            }
        }
        if (subIndex > -1) {
            return subIndex
        } else {
            [0, 1, 2].forEach(v => addCol(5 + v, 1))
            mainHead.list.unshift(...colHeads.list.slice(1, 4).map((v, k) => {
                v.text = subs[k]
                return v
            }) as ColSubHead[])
            mainHead.c = 4
            colHeads.list.splice(1, 3)
            return 0
        }

    }
})