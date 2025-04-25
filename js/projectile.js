// Passionyte 2025

'use strict'

import { newImg, CTX, Object, newAudio } from "./globals.js"

export const Projectiles = []

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

        if (s) this.sound = newAudio(null, 0.01)
    }
}

export default { Projectile }