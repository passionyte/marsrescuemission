// Passionyte 2025

'use strict'

import { CTX, Object, newImg, DEBUG, CANVAS } from "./globals.js"

export const Powerups = []

export const powerupClasses = { //  'smin' Minimum strength of the power-up, 'smax' Maximum strength of the power-up, 's' base strength, 'dur' duration of the powerup
    hp: {
        w: 128,
        h: 128,
        scale: 2,
        smin: 2,
        smax: 4,
        img: "heart",
        score: 10
    },
    armor: {
        w: 54,
        h: 54,
        scale: 1,
        smin: 2,
        smax: 4,
        score: 5
    },
    auto: {
        w: 275,
        h: 1274,
        s: true,
        dur: 10,
        scale: 16,
        score: 25
    },
    xspeed: {
        w: 272,
        h: 449,
        dur: 10,
        scale: 6,
        smin: 3,
        smax: 6,
        img: "speed",
        score: 15
    }
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
        if (DEBUG) super.draw()

        CTX.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.left, this.top, this.width, this.height)
    }

    constructor(type, set, score, x, y, w, h, scale, dur) {
        super(x, y, w, h, scale)

        this.type = type
        this.set = set
        this.img = newImg(`${powerupClasses[type].img || type}.png`)
        this.dur = dur
        this.score = score
    }
}

export default { Powerup }