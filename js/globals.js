export const CANVAS = d("canvas")
export const CTX = CANVAS.getContext("2d")

export const FPS = 60
export const DEBUG = false
export const MS_PER_FRAME = (1000 / FPS)

const useRaw = (document.URL.includes("passionyte.github.io/marsrescuemission"))

export const version = `1.5.2${((!useRaw) && " [DEV]") || ""}` 

export const Url = ((!useRaw) && "../") || "https://raw.githubusercontent.com/passionyte/marsrescuemission/refs/heads/main/"

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
        return (this.size.w / this.scale)
    }

    get height() {
        return (this.size.h / this.scale)
    }

    get top() {
        return this.position.y
    }

    get bottom() {
        return (this.position.y + (this.height / 2))
    }

    get left() {
        return (this.position.x - (this.width / 2))
    }

    get right() {
        return (this.left + this.width)
    }

    draw() {
        CTX.fillStyle = "red"
        CTX.fillRect(this.left, this.top, this.width, this.height)
    }

    constructor(x, y, w, h, scale = 1) {
        this.position.x = x
        this.position.y = y
        this.size.w = w
        this.size.h = h

        this.scale = scale
    }
}

// Some convenient keyboard codes
export const KEYS = {
    SPACE:32,
    UP_ARROW:38,
    LEFT_ARROW:37,
    DOWN_ARROW:40,
    RIGHT_ARROW:39,
    W:87,
    A:65,
    S:83,
    D:68,
    EQUALS:187,
    ENTER:13
   };

export const keyClasses = {
    shoot: [KEYS.SPACE, KEYS.UP_ARROW],
    left: [KEYS.A, KEYS.LEFT_ARROW],
    right: [KEYS.D, KEYS.RIGHT_ARROW],
    pause: [KEYS.EQUALS, KEYS.ENTER]
}

export function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min}

export function d(id) {
    return document.getElementById(id)
}

export function newImg(src) {
    const i = new Image()
    i.src = (Url + "imgs/") + (((src) && src) || "en_generic.png")

    return i
}

export function newAudio(src, v) {
    const a = new Audio((Url + "snds/") + (((src) && src) || "pew.mp3"))
    a.volume = v || 0.1

    return a
}

export function clearCanvas() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height)
}

export function cloneArray(a) {
    const c = []

    for (const x of a) {
        c.push(x)
    }

    return c
}

export default { CANVAS, CTX } 