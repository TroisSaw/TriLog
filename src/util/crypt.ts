function tcrypt(de: boolean, word: string) {
    let str = ''
    for (let i = 0; i < word.length; i++) {
        let code = word.charCodeAt(i);
        if (code < 32 || code > 126) {
            str += word.charAt(i)
        } else {
            const len = word.length
            code = ((i & 1) ^ +de)
                ? (code + i - 32 + len) % 95 + 32
                : ((code - i - 32 - len) % 95 + 95) % 95 + 32
            str += String.fromCharCode(code);
        }
    }
    return str;
}

export function encrypt(de: string) {
    return tcrypt(false, de)
}

export function decrypt(en: string) {
    return tcrypt(true, en)
}