import { CTX, newImg, Object, CANVAS } from "./globals.js"
import { Projectile, Projectiles } from "./projectile.js"

export const Enemies = []

export class Ship extends Object {
    img
    hp
    xspeed
    yspeed
    sdata
    last_shot = 0

    shoot() {
        if (!this.sdata || ((performance.now() - this.last_shot) < this.sdata.cooldown)) return
        this.last_shot = performance.now()

        const p = new Projectile(this.position.x, (this.position.y + ((this.sdata.inverted) && -25) || 25), 6, 12, this.sdata.time, this.sdata.color, this.sdata.damage)
        p.velocity.y = ((this.sdata.inverted) && -this.sdata.speed) || this.sdata.speed

        Projectiles.push(p)
    }

    update() {
        this.draw()

        const nx = (this.position.x + this.velocity.x)
        const ny  = (this.position.y + this.velocity.y)

        if (nx >= CANVAS.width  || nx <= 0 || ny >= CANVAS.height || ny <= 0) return

        this.position.x = nx
        this.position.y = ny
    }

    draw() {
        CTX.drawImage(this.img, 0, 0, this.width, this.height, (this.left - (this.width / 8)), this.top, (this.width / 4), (this.height / 4))
    }

    constructor(x, y, w, h, hp, xs, ys, sdata, src) {
        super(x, y, w, h)
        this.hp = hp

        this.xspeed = xs
        this.yspeed = ys
        this.sdata = sdata
        this.img = newImg(src)
    }
}

export class Player extends Ship {
    constructor(x, y, w, h, hp) {
        const sdata = {
            speed: 12,
            cooldown: 0.1,
            time: 1,
            inverted: true,
            color: "red",
            damage: 1
        }

        super(x, y, w, h, hp, 5, 0, sdata, "../images/ship.png")
    }
}

export default { Player }