import { CTX, Object, newImg, DEBUG, CANVAS } from "./globals.js"

export const Powerups = []

export const powerupClasses = { //  'smin' Minimum strength of the power-up, 'smax' Maximum strength of the power-up
    hp: {
        w: 128,
        h: 128,
        scale: 2,
        smin: 1,
        smax: 2,
        img: "heart",
        score: 10
    },
    armor: {
        w: 54,
        h: 54,
        scale: 1,
        smin: 1,
        smax: 4,
        score: 5
    },
}

export class Powerup extends Object {
    img
    type
    strength

    update() {
        this.draw()

        const nx = (this.position.x + this.velocity.x)
        const ny  = (this.position.y + this.velocity.y)

        const w = (this.width / 2)
        const h = (this.height / 2)

        if ((nx >= (CANVAS.width - w) || nx <= w) || (ny >= (CANVAS.height - h) || ny <= h)) return

        this.position.x = nx
        this.position.y = ny
    }

    draw() {
        if (DEBUG) {
            super.draw()
        }

        CTX.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.left, this.top, this.width, this.height)
    }

    constructor(type, strength, score, x, y, w, h, scale) {
        super(x, y, w, h, scale)

        this.type = type
        this.strength = strength
        this.img = newImg(`${powerupClasses[type].img || type}.png`)
        this.score = score
    }
}

export default { Powerup }