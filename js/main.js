'use strict'

import { DEBUG, MS_PER_FRAME, CANVAS, CTX, keyClasses } from "./globals.js"
import { Ship, Player } from "./player.js"
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
            console.log("attempting shot")
            HERO.shoot()
        }
    })

    document.addEventListener("keyup", ev => {
        const key = ev.keyCode

        if (!downKeys[key]) return

        downKeys[key] = false
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

    console.log(TIME_PASSED)

    // create bad guys


    // handle projectiles
    let i = 0
    for (const p of Projectiles) {
        if ((NOW - p.time) < p.life) {
            p.update()

            // check hit detection
        }
        else {
            Projectiles.splice(i, 1)
        }

        i++
    }

    // draw player

    HERO.update()
    if (DEBUG) {
        globalThis.HERO = HERO
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