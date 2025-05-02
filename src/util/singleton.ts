export default function singleton<T extends object, A extends any[]>(className: { new (...args: A): T }) {
    let ins: T | null = null;
    return new Proxy(className, {
        construct(target, args: A) {
            if (!ins) ins = new target(...args);
            return ins;
        }
    }) as { new (...args: A): T };
}