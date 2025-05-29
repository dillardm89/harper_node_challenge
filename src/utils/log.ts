export const log = {
    info: (...args: unknown[]) => console.log("info:", ...args),
    error: (...args: unknown[]) => console.error("error", ...args),
}
