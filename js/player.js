import { CTX, CANVAS, newImg, Object } from "./globals.js"
import { Projectile, Projectiles } from "./projectile.js"

export class Ship extends Object {
    img
    hp
    xspeed
    yspeed
    sdata
    last_shot = 0

    shoot() {
        console.log("Fire!")
        if (!this.sdata || ((performance.now() - this.last_shot) < this.sdata.cooldown)) return
        this.last_shot = performance.now()
        console.log("Pew!")

        const p = new Projectile(this.position.x, (this.position.y + 25), 2, 4, this.sdata.time, this.sdata.color, this.sdata.damage)
        p.velocity.y = ((this.sdata.inverted) && -this.sdata.speed) || this.sdata.speed
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.draw()
    }

    draw() {
        CTX.drawImage(this.img, 0, 0, this.width, this.height, this.left, this.top, this.width, this.height)
    }

    constructor(x, y, w, h, hp, sdata, src) {
        super(x, y, w, h)
        this.hp = hp

        this.sdata = sdata
        this.img = newImg(src)
    }
}

export class Player extends Ship {
    constructor(x, y, w, h, hp) {
        const sdata = {
            speed: 10,
            cooldown: 0.1,
            time: 4,
            inverted: true,
            color: "red",
            damage: 1
        }

        super(x, y, w, h, hp, sdata, "../images/ship.png")
        super.xspeed = 5
        super.yspeed = 0
    }
}

export default { Player }