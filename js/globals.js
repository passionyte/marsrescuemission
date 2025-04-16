export const CANVAS = d("canvas")
export const CTX = CANVAS.getContext("2d")

export const FPS = 60
export const DEBUG = true
export const MS_PER_FRAME = (1000 / FPS)

export class Object {
    position = {
        x: 0,
        y: 0
    }

    velocity = {
        x: 0,
        y: 0
    }

    size = {
        w: 0,
        h: 0
    }

    get width() {
        return this.size.w
    }

    get height() {
        return this.size.h
    }

    get top() {
        return this.position.y
    }

    get bottom() {
        return (this.position.y + this.img.height)
    }

    get left() {
        return this.position.x
    }

    get right() {
        return (this.position.x + this.img.width)
    }

    constructor(x, y, w, h) {
        this.position.x = x
        this.position.y = y
        this.size.w = w
        this.size.h = h
    }
}

// Some convenient keyboard codes
const KEYS = {
    SPACE:32,
    UP_ARROW:38,
    LEFT_ARROW:37,
    DOWN_ARROW:40,
    RIGHT_ARROW:39,
    W:87,
    A:65,
    S:83,
    D:68
   };

export const keyClasses = {
    shoot: [KEYS.SPACE, KEYS.UP_ARROW],
    left: [KEYS.A, KEYS.LEFT_ARROW],
    right: [KEYS.D, KEYS.RIGHT_ARROW]
}

export function d(id) {
    return document.getElementById(id)
}

export function newImg(src) {
    const i = new Image()
    i.src = src || "../images/en_generic.png"

    return i
}

export default { CANVAS, CTX } 