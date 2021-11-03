export function animateScrollTo(element: HTMLDivElement, to: number, duration: number) {
    const start = element.scrollTop
    const change = to - start
    let currentTime = 0
    const increment = 20

    const easeInOutQuad = function(
        currentTime: number,
        start: number,
        change: number,
        duration: number
    ) {
        currentTime /= duration / 2
        if (currentTime < 1) return (change / 2) * currentTime * currentTime + start
        currentTime--
        return (-change / 2) * (currentTime * (currentTime - 2) - 1) + start
    }

    return new Promise(resolve => {
        const animateScroll = () => {
            currentTime += increment
            element.scrollTop = easeInOutQuad(currentTime, start, change, duration)
            if (currentTime < duration) {
                setTimeout(animateScroll, increment)
            } else {
                // wait when scrolling and all its side-effects are done
                setTimeout(resolve, 100)
            }
        }
        animateScroll()
    })
}
