export interface Permission {
    p: 0|1|2 // 不能编辑删除 | 能编辑，不能删除 | 能编辑删除
}

//单元格
export interface Cell {
    text: string
    r: Exclude<number, 0|1>
    c: Exclude<number, 0>
}

// 列小标题
export interface ColSubHead extends Permission {
    text: string
    r: 1
    c: Exclude<number, 0>
    width: number
    end: true
}

export interface ColSubHeadInMain {
    mainC: number
    sub: ColSubHead
}
// 列大标题
export interface ColMainHead extends Permission {
    text: string
    r: 0
    c: Exclude<number, 0>
    end: false
    list: ColSubHead[]
}

export type ColHeadList = Array<ColMainHead | ColSubHead>

// 列标题配置
export interface ColHeads {
    // height: number
    cols: number
    list: ColHeadList
}

// 行小标题
export interface RowSubHead extends Permission {
    text: string
    r: Exclude<number, 0|1>
    c: 0
}

export type RowHeadList = Array<RowSubHead>

// 行标题配置
export interface RowHeads {
    width: number
    rows: number
    list: RowHeadList
}

//表格
export interface TableData {
    colHeads: ColHeads
    rowHeads: RowHeads
    body: Cell[][]
    name: string
}

export interface TableConfig {
    selId: number
    idList: string[]
}

export interface TableList {
    config: TableConfig
    list: TableData[]
}

export const initTableList: TableList = {
    config: {
        selId: 0,
        idList: ['sheet1']
    },
    list: [
        {
            name: 'sheet1',
            colHeads: {
                // height: 52,
                cols: 4,
                list: [
                    {
                        text: '统计',
                        r: 0,
                        c: 1,
                        end: false,
                        p: 0,
                        list: [
                            { text: '最高值', width: 100, r: 1, c: 1, end: true, p: 0 },
                            { text: '最低值', width: 100, r: 1, c: 2, end: true, p: 0 },
                            { text: '平均值', width: 100, r: 1, c: 3, end: true, p: 0 },
                            { text: '总时长', width: 100, r: 1, c: 4, end: true, p: 0 },
                        ]
                    },
                ],
            },
            rowHeads: {
                width: 100,
                rows: 1,
                list: [
                    { text: '任务1', r: 2, c: 0, p: 2 },
                ]
            },
            body: []
        }
    ]
}

export function isTableData(target: any): target is TableData {
    // 1. 验证目标对象是否为 TableData 类型
    if (
        typeof target !== 'object' ||
        typeof target.name !== 'string' ||
        !Array.isArray(target.body) ||
        !target.colHeads ||
        !Array.isArray(target.colHeads.list) ||
        !target.rowHeads ||
        !Array.isArray(target.rowHeads.list)
    ) {
        console.log(1)
        return false;
    }

    // 2. 验证 colHeads.list 是否包含 initTableList 中的 4 条数据
    const colHeadsList = target.colHeads.list;
    const requiredColSubHeads = [
        { text: '最高值', c: 1 },
        { text: '最低值', c: 2 },
        { text: '平均值', c: 3 },
        { text: '总时长', c: 4 },
    ];

    const colMainHead = colHeadsList.find((v: any) => v.r === 0 && v.c === 1 && !v.end && Array.isArray(v.list));
    if (!colMainHead || colMainHead.list.length < 4 || colMainHead.p) {
        console.log(2.1)
        return false;
    }

    for (const required of requiredColSubHeads) {
        const found = colMainHead.list.find((subHead: any) => subHead.text === required.text && subHead.c === required.c && !subHead.p);
        if (!found) {
            console.log(2.2)
            return false;
        }
    }

    // 3. 验证 rowHeads.list 是否至少有一条数据
    if (!target.rowHeads.list.length) {
        console.log(3)
        return false;
    }

    return true;
}