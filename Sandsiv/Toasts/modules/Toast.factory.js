let id = 0;

const defaultOptions = {
    type: "info",
    timeout: 3000
};

export function createDefaultToast(options) {
    return {
        ...defaultOptions,
        ...options,
        id: id++
    }
}
