import { CTX, newImg, Object, CANVAS, DEBUG } from "./globals.js"
import { Projectile, Projectiles } from "./projectile.js"

export const Enemies = []
export const enemyClasses = {
    generic: {
        w: 645,
        h: 456,
        hp: 1,                                  
        xs: 1,
        ys: 1,
        scale: 8
    },

}

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
        p.player = (this.type == "Player")

        Projectiles.push(p)
    }

    update() {
        this.draw()

        const nx = (this.position.x + this.velocity.x)
        const ny  = (this.position.y + this.velocity.y)

        const w = (this.width / 2)
        const h = (this.height / 2)

        if (nx >= (CANVAS.width - w) || nx <= w || ny >= (CANVAS.height - h) || ny <= h) {
            if (this.type != "Player") {
                if (this.varspeed) {
                    this.varspeed *= -1
                }
            }

            return
        }

        this.position.x = nx
        this.position.y = ny
    }

    draw() {
        if (DEBUG) {
            super.draw()
        }

        CTX.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.left, this.top, this.width, this.height)
    }

    constructor(type, x, y, w, h, hp, xs, ys, sdata, scale, src) {
        super(x, y, w, h, scale)

        this.type = type
        this.hp = hp

        this.xspeed = xs
        this.yspeed = ys
        this.sdata = sdata

        this.scale = scale
        this.img = newImg(src || `../images/en_${type}.png`)
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

        super("Player", x, y, w, h, hp, 5, 0, sdata, 4, "../images/ship.png")
    }
}

export default { Player }