'use strict'

import { DEBUG, MS_PER_FRAME, CANVAS, CTX, keyClasses, randInt, clearCanvas } from "./globals.js"
import { Ship, Player, Enemies, enemyClasses } from "./player.js"
import { Projectiles, checkCollision } from "./projectile.js"
import { Levels } from "./levels.js"

// Variables

let frame_time = performance.now()
let HERO = new Player((CANVAS.width / 2), (CANVAS.height - 100), 388, 299, 5)
let lnum = 1
let level = Levels[lnum]
let SCORE = 0
let PAUSED = false
let FOCUSED = true

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

    if (PAUSED || !FOCUSED) return
    // Clear the canvas
    clearCanvas()
 
    // create bad guys

    for (const nm in level.enemyCounts) {
        if (level.enemiesSpawned[nm] < level.enemyCounts[nm]) {
            const c = enemyClasses[nm]

            if (!c) return

            const e = new Ship(nm, randInt(50, CANVAS.width - 50), randInt(50, 250), c.w, c.h, c.hp, c.xs, c.ys, c.sdata, c.scale, c.src)
            Enemies.push(e)

            level.enemiesSpawned[nm]++
        }
    }

    // handle bad guys

    let ei = 0
    for (const e of Enemies) {
        if (e.hp <= 0) {
            Enemies.splice(ei, 1)   
            SCORE++
        }
        else {
            if (!e.varspeed) e.varspeed = -e.xspeed
            e.velocity.x = e.varspeed
            e.velocity.y = e.yspeed

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

            if (!p.player) {
                // check player collision
                if (checkCollision(HERO, p)) {
                    HERO.hp -= p.damage
                    Projectiles.splice(pi, 1)
                }
            }
            else {
                // check enemy collision
                for (const e of Enemies) {
                    if (checkCollision(e, p)) {
                        console.log("Hit!")
                        e.hp -= p.damage
                        Projectiles.splice(pi, 1)
                    }
                }
            }
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

    // do win condition
    
    if (Enemies.length == 0) {
        PAUSED = true
        clearCanvas()

        console.log("Player won this level")
        
        lnum++
        const nextlvl = Levels[lnum]

        if (nextlvl) {
            CTX.font = "50px Arial"
            CTX.fillStyle = "white"
            CTX.fillText(`Moving on to Level ${lnum}...`, (CANVAS.width / 2) - 100, (CANVAS.height / 2), 500)
            setTimeout(function() {
                level = nextlvl
                PAUSED = false
            }, 5000)
        }
        else {
            console.log("Player won all levels!")
            CTX.font = "50px Arial"
            CTX.fillStyle = "green"
            CTX.fillText("You win!", (CANVAS.width / 2) - 100, (CANVAS.height / 2), 200)
        }
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
    CTX.fillStyle = "white"

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