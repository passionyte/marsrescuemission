'use strict'

import { DEBUG, MS_PER_FRAME, CANVAS, CTX, keyClasses, randInt, clearCanvas, newImg, cloneArray, newAudio } from "./globals.js"
import { Ship, Player, Enemies, enemyClasses } from "./player.js"
import { Projectiles, checkCollision } from "./projectile.js"
import { Levels } from "./levels.js"
import { Powerup, powerupClasses, Powerups } from "./powerup.js"

// Variables

let frame_time = performance.now()
const pHP = 10
const mAR = 10 // Max armor
export const HERO = new Player((CANVAS.width / 2), (CANVAS.height - 100), 388, 299, pHP, 10)
let lnum = 1
let level = Levels[lnum]
let SCORE = 0
let cdsecs = 0
let cd
let nextlvl
let PAUSED = false
let FOCUSED = true

let hurt = newAudio("pop.wav", 0.01)

// Input

const downKeys = {}
const downClasses = {}

function getClassFromKey(key) {
    let result

    for (const c in keyClasses) {
        if (keyClasses[c].includes(key)) {
            result = c
            break
        }
    }

    return result
}

function input() {
    document.addEventListener("keydown", ev => {
        const key = ev.keyCode

        if (downKeys[key]) return

        downKeys[key] = true
        downClasses[getClassFromKey(key)] = true

        if (PAUSED || !FOCUSED) return

        if (keyClasses.shoot.includes(key)) {
            HERO.shoot()
        }
    })

    document.addEventListener("keyup", ev => {
        const key = ev.keyCode

        if (!downKeys[key]) return

        downKeys[key] = false
        downClasses[getClassFromKey(key)] = false
    })
}

// Callbacks

function countDown() {
    clearCanvas()
    CTX.font = "50px Arial"
    CTX.fillStyle = "white"
    CTX.fillText(`Clear! Incoming: Level ${lnum}`, (CANVAS.width / 2) - 200, (CANVAS.height / 2), 400)

    CTX.font = "30px Arial"
    CTX.fillStyle = "yellow"
    CTX.fillText(`${(5 - cdsecs)}...`, (CANVAS.width / 2) - 10, (CANVAS.height / 2) + 50, 200)

    if (cdsecs == 5) {
        clearInterval(cd)
        cdsecs = 0
        level = nextlvl

        HERO.velocity.x = 0
        HERO.position.x = (CANVAS.width / 2)
        PAUSED = false
    } 

    cdsecs++
}

// Image initiations

const Heart = newImg("heart.png")
let HeartScale = 4
let HeartSize = 128
let ArmorScale = 2
let ArmorSize = 51

function newHeart(i, src, xo, yo, scale) {
    let size = HeartSize
    if (src.includes("Armor")) size = ArmorSize

    const s = (size / scale)

    if (src) {
        Heart.src = `../images/${src}`
    }

    CTX.drawImage(Heart, 0, 0, 128, 128, ((i * s) + xo), (((CANVAS.height) - s) + yo), s, s)
}

function drawHP(xo = 0, yo = 0) {
    // half a heart = 1 hp (Minecraft based system)

    const remainder = (pHP - HERO.hp)
    const emptyHearts = Math.floor((remainder / 2))
    const halfHeart = (((remainder / 2) % 1) == 0.5)
    const fullHearts = (Math.floor(((pHP / 2) - emptyHearts)) - ((halfHeart) && 1) || 0)

    let heartCount = 0

    for (let i = 0; (i < fullHearts); i++) {
        newHeart(heartCount, "heart.png", xo, yo, HeartScale)
        heartCount++
    }

    if (halfHeart) { // Only one half heart can exist
        newHeart(heartCount, "heart_half.png", xo, yo, HeartScale)
        heartCount++
    }

    for (let i = 0; (i < emptyHearts); i++) {
        newHeart(heartCount, "heart_empty.png", xo, yo, HeartScale)
        heartCount++
    }
}

function drawArmor(xo = 0, yo = 0) {
    // half a armor = 1 armor (Minecraft based system)

    const toFill = (mAR - HERO.armor)
    
    if (toFill == 10) return

    const fullArmors = ((mAR / 2) - Math.floor((toFill / 2)))
    const halfArmor = (((toFill / 2) % 1) == 0.5)
    const emptyArmors = (((toFill / 2) - fullArmors) - (((halfArmor)) && 1) || 0)

    console.log(fullArmors)

    let armorCount = 0

    for (let i = 0; (i < fullArmors); i++) {
        newHeart(armorCount, "armor.png", xo, yo, ArmorScale)
        armorCount++
    }

    if (halfArmor) { // Only one half armor can exist
        newHeart(armorCount, "armor_half.png", xo, yo, ArmorScale)
        armorCount++
    }

    for (let i = 0; (i < emptyArmors); i++) {
        newHeart(armorCount, "armor_empty.png", xo, yo, ArmorScale)
        armorCount++
    }
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

    // create power-ups

    for (const c in level.powerUps) {
        const d = powerupClasses[c]

        if (!d) return

        if (randInt(1, level.powerUps[c]) == 1) {
            const p = new Powerup(c, randInt(d.smin, d.smax), randInt(50, (CANVAS.width - 50)), randInt(50, 250), d.w, d.h, d.scale)

            Powerups.push(p)
        }
    }
 
    // create bad guys

    for (const nm in level.enemyCounts) {
        if (level.enemiesSpawned[nm] < level.enemyCounts[nm]) {
            const c = enemyClasses[nm]

            if (!c) return

            const e = new Ship(nm, randInt(50, (CANVAS.width - 50)), randInt(50, 250), c.w, c.h, c.hp, c.xs, c.ys, c.sdata, c.scale, c.src)
            Enemies.push(e)

            level.enemiesSpawned[nm]++
        }
    }

    // handle bad guys

    let ei = 0
    const fakeEnemies = cloneArray(Enemies) // Fixes that flickering issue

    for (const e of fakeEnemies) {
        if (e.hp <= 0) {
            e.boom.play()
            Enemies.splice(ei, 1)   
            SCORE++
        }
        else {
            if (!e.varspeed) e.varspeed = -e.xspeed
            e.velocity.x = e.varspeed
            e.velocity.y = e.yspeed

            e.update()

            if (e.sdata) {
                const coold = (e.sdata.cooldown * 1000)

                if ((NOW - e.last_shot) > (coold + ((randInt(0.1, 0.4) - 0.1) * coold))) {
                    e.shoot()
                }
            }

            if (checkCollision(HERO, e)) {
                HERO.hp = 0
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
                    hurt.play()
                    HERO.hp -= p.damage
                    Projectiles.splice(pi, 1)
                }
            }
            else {
                // check enemy collision
                for (const e of Enemies) {
                    if (checkCollision(e, p)) {
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

    HERO.velocity.x = ((downClasses.left) && -HERO.xspeed || (downClasses.right) && HERO.xspeed) || 0
    HERO.update()

    // draw hp

    drawHP()

    // draw armor

    drawArmor(0, -(128 / HeartScale))

    // draw level

    CTX.font = "40px Arial"
    CTX.fillStyle = "yellow"
    CTX.fillText(`Lvl: ${lnum}`, 0, (CANVAS.height - (128 / HeartScale)), 200)

    // draw score

    CTX.font = "40px Arial"
    CTX.fillStyle = "white"
    CTX.fillText(SCORE, (CANVAS.width - 50), CANVAS.height, 200)

    // do lose condition

    if (HERO.hp <= 0) {
        PAUSED = true
        clearCanvas()

        CTX.font = "50px Arial"
        CTX.fillStyle = "red"
        CTX.fillText("You died!", (CANVAS.width / 2) - 100, (CANVAS.height / 2), 200)

        CTX.fillStyle = "white"
        CTX.fillText(`Score: ${SCORE}`, (CANVAS.width / 2) - 100, (CANVAS.height / 2) + 85, 200)
    }

    // do win condition
    
    if (Enemies.length == 0) {
        PAUSED = true
        clearCanvas()
        
        lnum++
        nextlvl = Levels[lnum]
        Projectiles.splice(0, Projectiles.length)

        if (nextlvl) {
            CTX.font = "50px Arial"
            CTX.fillStyle = "white"
            CTX.fillText(`Clear! Incoming: Level ${lnum}`, (CANVAS.width / 2) - 200, (CANVAS.height / 2), 400)

            cd = setInterval(countDown, ((!DEBUG) && 1000) || 1)
        }
        else {
            CTX.font = "50px Arial"
            CTX.fillStyle = "green"
            CTX.fillText("You win!", (CANVAS.width / 2) - 100, (CANVAS.height / 2), 200)

            if (HERO.hp == pHP) {
                CTX.fillText("Perfect!", (CANVAS.width / 2) - 87, (CANVAS.height / 2) + 100, 200)
            }
            else {
                CTX.fillStyle = "white"
                CTX.fillText("HP remaining:", (CANVAS.width / 2) - 95, (CANVAS.height / 2) + 80, 200)

                drawHP((CANVAS.width / 2) - 85, -250)
            }

            CTX.fillStyle = "white"
            CTX.fillText(`Score: ${SCORE}`, (CANVAS.width / 2) - 100, (CANVAS.height / 2) + 235, 200)
        }
    }

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
    CTX.fillStyle = "white"

    CTX.font = "40px Arial"
    CTX.fillText("Mars Rescue Mission", (CANVAS.width / 2) - 180, (CANVAS.height / 2), 400)
    CTX.font = "20px Arial"
    CTX.fillText("Remastered", (CANVAS.width / 2) - 50, (CANVAS.height / 2) + 25, 400)

    CTX.font = "25px Arial"
    CTX.fillText("Press Space to play", (CANVAS.width / 2) - 110, (CANVAS.height / 2) + 100, 400)

    CTX.font = "25px Arial"
    CTX.fillText("©2025 Passionyte", (CANVAS.width / 2) - 100, CANVAS.height - 50, 400)

    document.addEventListener("keydown", startgame)
}

if (!DEBUG) {
    spritescreen()
}
else {
    startgame(false)
}

export default { HERO }