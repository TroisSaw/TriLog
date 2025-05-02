export interface MenuItem {
    [key: string]: Function
}

export interface EquipItem {
    test(r: number, c: number, p: number): boolean
    text: string
    fn(r?: number, c?: number, p?: number): void
}