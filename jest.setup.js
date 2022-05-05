global.delay = (n) => new Promise((resolve) => setTimeout(resolve, n))

global.tryCatch = (fn) => {
    try {
        fn()
    } catch (e) {
        //
    }
}
