export const CANVAS = d("canvas")
export const CTX = CANVAS.getContext("2d")

export const FPS = 60
export const DEBUG = true
export const MS_PER_FRAME = (1000 / FPS)

export function d(id) {
    return document.getElementById(id)
}

export function newImg(src) {
    const i = new Image()
    i.src = src || "./images/galaga.png"

    return i
}

export default { CANVAS, CTX } 