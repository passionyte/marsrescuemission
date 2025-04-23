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
            color: "skyblue",
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
            color: "yellow",
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
            color: "pink",
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
        w: 498,
        h: 219,
        hp: 10,
        xs: 3,
        ys: 0,
        scale: 2.5,
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
            color: "orange",
            speed: 22,
            life: 0.33,
            bullets: 5,
            spreadmin: -200,
            spreadmax: 300
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
        const s = this.sdata

        if (!s || ((NOW - this.last_shot) < (s.cooldown * 1000))) return

        this.last_shot = NOW

        const yo = ((s.inverted) && -25) || 25
        const fromPlr = (this.type == "Player")
        const b = ((s.bullets) && s.bullets) || 1   

        for (let i = 0; (i < b); i++) {
            const spread = (((s.spreadmin != null) && (this.width * (randInt(s.spreadmin, s.spreadmax) / 100) - (this.width / 2)) || 0))
            const p = new Projectile((this.position.x + spread), (this.position.y + yo), 6, 12, s.life, s.color, s.damage, (i == 0))

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

        if (ny >= (CANVAS.height - h) || ny <= h) {
            if (this.type != "Player") HERO.hp = 0

            return
        }

        this.position.x = nx
        this.position.y = ny
    }

    draw() {
        if (DEBUG) super.draw()

        CTX.drawImage(this.img, 0, 0, this.size.w, this.size.h, this.left, this.top, this.width, this.height)
    }

    constructor(type, x, y, w, h, hp, xs, ys, sdata, scale, src, score, bar, barcolor) {
        super(x, y, w, h, scale)

        this.type = type
        this.hp = hp
        this.maxhp = hp

        this.xspeed = xs
        this.yspeed = ys
        this.sdata = sdata
        this.score = score

        this.bar = (bar)
        this.barcolor = barcolor

        this.scale = scale
        this.img = newImg(src || `en_${type}.png`)
    }
}

export class Player extends Ship {
    constructor(x, y, w, h, hp, ar) {
        const sdata = {
            speed: 12,
            cooldown: 0.1,
            life: 1,
            inverted: true,
            color: "red",
            damage: 1,
        }

        super("Player", x, y, w, h, hp, 7, 0, sdata, 4, "ship.png")

        this.auto = false // Auto firing for a powerup
        this.armor = ar // NPC ships can not have armor
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