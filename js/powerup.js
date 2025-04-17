import { CTX, Object, newImg } from "./globals.js"

export const Powerups = []

export const powerupClasses = { //  'smin' Minimum strength of the power-up, 'smax' Maximum strength of the power-up
    heart: {
        w: 128,
        h: 128,
        scale: 2,
        smin: 1,
        smax: 2
    },
    armor: {
        w: 128,
        h: 128,
        scale: 2,
        smin: 1,
        smax: 4
    },
}

export class Powerup extends Object {
    img
    type
    strength

    draw() {
        if (DEBUG) {
            super.draw()
        }

        CTX.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.left, this.top, this.width, this.height)
    }

    constructor(type, strength, x, y, w, h, scale) {
        super(x, y, w, h, scale)

        this.type = type
        this.strength = strength
        this.img = newImg(`${type}.png`)
    }
}

export default { Powerup }