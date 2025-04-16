'use strict'

import { DEBUG, MS_PER_FRAME, CANVAS, CTX, keyClasses, randInt, KEYS } from "./globals.js"
import { Ship, Player, Enemies } from "./player.js"
import { Projectiles } from "./projectile.js"

// Variables

let frame_time = performance.now()
let HERO = new Player((CANVAS.width / 2), (CANVAS.height - 100), 388, 299, 5)

// Input

const downKeys = {}

function input() {
    document.addEventListener("keydown", ev => {
        const key = ev.keyCode

        if (downKeys[key]) return

        downKeys[key] = true

        if (keyClasses.shoot.includes(key)) {
            HERO.shoot()
        }
        else if (keyClasses.left.includes(key)) {
            HERO.velocity.x = -HERO.xspeed
        }
        else if (keyClasses.right.includes(key)) {
            HERO.velocity.x = HERO.xspeed
        }
    })

    document.addEventListener("keyup", ev => {
        const key = ev.keyCode

        if (!downKeys[key]) return

        downKeys[key] = false

        if ((keyClasses.left.includes(key) || keyClasses.right.includes(key))) {
            HERO.velocity.x = 0
        }
    })
}


function update() {
    requestAnimationFrame(update)

     /*** Desired FPS Trap ***/
    const NOW = performance.now()
    const TIME_PASSED = NOW - frame_time
    if (TIME_PASSED < MS_PER_FRAME) return
    const EXCESS_TIME = TIME_PASSED % MS_PER_FRAME
    frame_time = NOW - EXCESS_TIME
    /*** END FPS Trap ***/
    // Clear the canvas
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height)

    // create bad guys

    if (randInt(1, 100) == 1) {
        console.log('creating guy')
        const t = new Ship(randInt(100, CANVAS.width - 100), randInt(50, 200), 645, 456, 1, {
            color: "green",
            life: 3,
            damage: 1,
            speed: 4
        }, "..images/en_generic.png") 

        Enemies.push(t)
    } 

    // handle bad guys

    let ei = 0
    for (const e of Enemies) {
        if (e.hp <= 0) {
            Enemies.splice(ei, 1)
        }
        else {
            e.update()

            if (e.sdata && randInt(1, (20 * e.sdata.cooldown)) == 1) {
                e.shoot()
            }
        }
        
        ei++
    }

    // handle projectiles
    let pi = 0
    for (const p of Projectiles) {
        if ((NOW - p.time) < (p.life * 1000)) {
            p.update()

            // check hit detection
        }
        else {
            Projectiles.splice(pi, 1)
        }

        pi++
    }

    // draw player

    HERO.update()

    // do debug stuff

    if (DEBUG) {
        globalThis.HERO = HERO
        globalThis.Projectiles = Projectiles
        globalThis.Enemies = Enemies
    }
}

function startgame(ev) {
    if (!ev || (keyClasses.shoot.includes(ev.keyCode))) {
        document.removeEventListener("keydown", startgame)

        update()
        input()
    }
}

function spritescreen() {
    CTX.fillStyle = "black"

    CTX.font = "40px Arial"
    CTX.fillText("Mars Rescue Mission", (CANVAS.width / 2) - 180, (CANVAS.height / 2), 400)
    CTX.font = "20px Arial"
    CTX.fillText("Remastered", (CANVAS.width / 2) - 50, (CANVAS.height / 2) + 25, 400)

    CTX.font = "25px Arial"
    CTX.fillText("Press Space to play", (CANVAS.width / 2) - 110, (CANVAS.height / 2) + 100, 400)

    document.addEventListener("keydown", startgame)
}

if (!DEBUG) {
    spritescreen()
}
else {
    startgame(false)
}