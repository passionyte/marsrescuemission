// Passionyte 2025

'use strict'

import { newImg, CTX, Object, randInt } from "./globals.js"
import { newSound } from "./sounds.js"

export const Projectiles = []
export const Confettis = []

export function checkCollision(o0, o1) {
    if (o0.right <= o1.left || o0.left >= o1.right) return false
    if (o0.bottom <= o1.top || o0.top >= o1.bottom) return false
    return true
}

export class Projectile extends Object {
    img = newImg()
    color
    life
    time
    damage
    sound

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.draw()
    }

    draw() {
        CTX.fillStyle = this.color
        CTX.fillRect(this.left, this.top, this.width, this.height)
    }

    constructor(x, y, w, h, l, c = "red", d = 1, s) {
        super(x, y, w, h)

        this.life = l
        this.color = c
        this.damage = d
        this.time = performance.now()

        if (s) this.sound = newSound(null, 0.01)
    }
}

export class Confetti extends Object {
    color
    life = 3

    update() {
        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y
        this.draw()
    }

    draw() {
        CTX.fillStyle = this.color
        CTX.fillRect(this.left, this.top, this.width, this.height)
    }

    constructor(x, y) {
        super(x, y, randInt(8, 16), randInt(9, 18), 1)
        this.color = `rgb(${randInt(50, 255)}, ${randInt(50, 255)}, ${randInt(50, 255)})`
        this.time = performance.now()
    }
}

export default { Projectile }