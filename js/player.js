// Passionyte 2025

'use strict'

import { CTX, newImg, Object, CANVAS, DEBUG, newAudio, randInt } from "./globals.js"
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
            color: [
                "skyblue",
                "red"
            ],
            speed: 6,
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
            color: [
                "yellow",
                "orange"
            ],
            speed: 32,
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
            color: [
                "pink",
                "purple"
            ],
            speed: 10,
            life: 1
        }
    },
    minion: {
        w: 960,
        h: 698,
        hp: 3,
        xs: 3,
        ys: 1,
        scale: 10,
        sdata: {
            cooldown: 0.4,
            damage: 1,
            color: "red",
            speed: 12,
            life: 0.8
        }
    },
    boss: {
        w: 123,
        h: 57,
        hp: 10,
        xs: 3,
        ys: 0,
        scale: 1,
        bar: true,
        barcolor: "red",
        score: 100,
        sdata: {
            cooldown: 0.15,
            damage: 2,
            color: "red",
            speed: 20,
            life: 0.6,
            spreadmin: 0,
            spreadmax: 100
        }
    },
    spectral: {
        w: 645,
        h: 456,
        hp: 1,
        xs: -3,
        ys: 0,
        scale: 8,
        sdata: {
            cooldown: 1.5,
            damage: 1,
            color: "lime",
            speed: 14,
            life: 1,
            bullets: 3,
            spreadmin: 0,
            spreadmax: 100
        }
    },
    ghost: {
        w: 645,
        h: 456,
        hp: 1,
        xs: -5,
        ys: 4,
        scale: 8
    },
    magma: {
        w: 645,
        h: 456,
        hp: 2,
        xs: 4,
        ys: 1,
        scale: 8,
        sdata: {
            cooldown: 2,
            damage: 1,
            color: [
                "orange",
                "red",
                "yellow"
            ],
            speed: 22,
            life: 0.5,
            bullets: 5,
            spreadmin: -100,
            spreadmax: 200
        },
        score: 2
    },
    darkblue: {
        w: 120,
        h: 80,
        hp: 3,
        xs: 6,
        ys: 1,
        scale: 1.5,
        sdata: {
            cooldown: 0.12,
            damage: 1,
            color: "blue",
            speed: 10,
            life: 1,
            spreadmin: 0,
            spreadmax: 100
        },
        score: 5
    },
    purple: {
        w: 82,
        h: 81,
        hp: 4,
        xs: 2,
        ys: -1,
        scale: 1.2,
        sdata: {
            cooldown: 3.5,
            damage: 5,
            color: "purple",
            speed: 40,
            life: 0.33  ,
        },
        score: 3
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
        const s = this.sdata

        if (!s || ((NOW - this.last_shot) < (s.cooldown * 1000))) return

        this.last_shot = NOW

        const yo = ((s.inverted) && -25) || 25
        const fromPlr = (this.type == "Player")
        const b = ((s.bullets) && s.bullets) || 1   

        for (let i = 0; (i < b); i++) {
            const spread = (((s.spreadmin != null) && (this.width * (randInt(s.spreadmin, s.spreadmax) / 100) - (this.width / 2)) || 0))
            const c = ((typeof(s.color) == "string") && s.color) || s.color[(randInt(1, s.color.length) - 1)]
            const p = new Projectile((this.position.x + spread), (this.position.y + yo), 6, 12, s.life, c, s.damage, (i == 0))

            if (i == 0) p.sound.play()
            p.velocity.y = ((s.inverted) && -s.speed) || s.speed
            p.player = fromPlr
            Projectiles.push(p)
        }
    }

    update() {
        this.draw()
        
        const nx = (this.position.x + this.velocity.x)
        const ny  = (this.position.y + this.velocity.y)

        const w = (this.width / 2)
        const h = (this.height / 2)

        if (nx >= (CANVAS.width - w) || nx <= w) {
            if (this.type != "Player") if (this.varspeed) this.varspeed *= -1

            return
        }

        this.position.x = nx

        if (ny >= (CANVAS.height - h)) {
            if (this.type != "Player") HERO.hp = 0

            return
        }

        if (ny <= h) return

        this.position.y = ny
    }

    draw() {
        if (DEBUG) super.draw()

        CTX.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.left, this.top, this.width, this.height)
    }

    constructor(type, d, sd) {
        super(d.x, d.y, d.w, d.h, d.scale)

        this.type = type
        this.hp = d.hp
        this.maxhp = this.hp

        this.xspeed = d.xs
        this.yspeed = d.ys
        this.sdata = sd
        this.score = d.score

        this.bar = (d.bar)
        this.barcolor = d.barcolor

        this.scale = d.scale
        this.img = newImg(d.src || `en_${type}.png`)
    }
}

export class Player extends Ship {
    constructor(d) {
        const sd = { // Shot data
            speed: 12,
            cooldown: 0.1,
            life: 1,
            inverted: true,
            color: "red",
            damage: 1,
        }

        super("Player", d, sd)

        this.auto = false // Auto firing for a powerup
        this.armor = d.armor // NPC ships can not have armor
    }
}

export function addStat(s, nm, x, max = 10) {
    if (s[nm] != null) {
        let a = (s[nm] + x)

        if (a > max) a = max

        s[nm] = a

        if (s[nm] < 0) s[nm] = 0
    }
}

export default { Player }