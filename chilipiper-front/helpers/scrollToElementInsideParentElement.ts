import { animateScrollTo } from './animateScrollTo'

export const scrollToElementInsideParentElement = (
    parent: HTMLDivElement,
    elem: HTMLDivElement,
    delay = 300
) => {
    const parentTop = parent.getBoundingClientRect().top
    const elemTop = elem.getBoundingClientRect().top
    return animateScrollTo(parent, elemTop + parent.scrollTop - parentTop, delay)
}
