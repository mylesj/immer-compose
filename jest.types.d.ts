export {}

declare global {
    function delay(n: number): Promise<void>
    function tryCatch(fn: () => void): void
}
