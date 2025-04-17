import { CTX, newImg, Object, CANVAS, DEBUG, newAudio } from "./globals.js"
import { Projectile, Projectiles } from "./projectile.js"
import { HERO } from "./main.js"

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
    blue: {
        w: 645,
        h: 456,
        hp: 1,
        xs: 3,
        ys: 2,
        scale: 8
    },
    pink: {
        w: 280,
        h: 283,
        hp: 1,
        xs: 1,
        ys: 3,
        scale: 4,
    },
    redblue: {
        w: 645,
        h: 456,
        hp: 1,
        xs: 2,
        ys: 1,
        scale: 8,
        sdata: {
            cooldown: 1,
            damage: 1,
            color: "skyblue",
            speed: 8,
            life: 2
        }
    },
    orangeyellow: {
        w: 645,
        h: 456,
        hp: 1,
        xs: 3,
        ys: 1,
        scale: 8,
        sdata: {
            cooldown: 0.1,
            damage: 1,
            color: "yellow",
            speed: 30,
            life: 0.14
        }
    },
    pinkpurple: {
        w: 645,
        h: 456,
        hp: 2,
        xs: 5,
        ys: 1,
        scale: 8,
        sdata: {
            cooldown: 0.5,
            damage: 1,
            color: "pink",
            speed: 12,
            life: 1
        }
    },
    minion: {
        w: 960,
        h: 698,
        hp: 3,
        xs: 3,
        ys: 2,
        scale: 10,
        sdata: {
            cooldown: 0.4,
            damage: 2,
            color: "red",
            speed: 15,
            life: 0.8
        }
    }
}

export class Ship extends Object {
    img
    hp
    xspeed
    yspeed
    sdata
    last_shot = 0
    boom = newAudio("boom.wav", 0.01)

    shoot() {
        const NOW = performance.now()
        if (!this.sdata || ((NOW - this.last_shot) < this.sdata.cooldown)) return

        this.last_shot = NOW

        const yo = ((this.sdata.inverted) && -25) || 25
        const p = new Projectile(this.position.x, (this.position.y + yo), 6, 12, this.sdata.life, this.sdata.color, this.sdata.damage)
        p.sound.play()
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

        if (nx >= (CANVAS.width - w) || nx <= w) {
            if (this.type != "Player") {
                if (this.varspeed) {
                    this.varspeed *= -1
                }
            }

            return
        }

        if (ny >= (CANVAS.height - h) || ny <= h) {
            if (this.type != "Player") {
                HERO.hp = 0
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
        this.img = newImg(src || `en_${type}.png`)
    }
}

export class Player extends Ship {
    constructor(x, y, w, h, hp) {
        const sdata = {
            speed: 12,
            cooldown: 0.1,
            life: 1,
            inverted: true,
            color: "red",
            damage: 1
        }

        super("Player", x, y, w, h, hp, 5, 0, sdata, 4, "ship.png")
    }
}

export default { Player }