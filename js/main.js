'use strict'

import { DEBUG, MS_PER_FRAME, CANVAS, CTX, keyClasses, randInt, clearCanvas, newImg, cloneArray, newAudio, version } from "./globals.js"
import { Ship, Player, Enemies, enemyClasses, addStat } from "./player.js"
import { Projectiles, checkCollision } from "./projectile.js"
import { Levels } from "./levels.js"
import { Powerup, powerupClasses, Powerups } from "./powerup.js"

// Variables

let frame_time = performance.now()

const maxes = {
    hp: 10,
    armor: 10
}

export const HERO = new Player((CANVAS.width / 2), (CANVAS.height - 100), 388, 299, maxes.hp, maxes.armor)
let lnum = 1
let level = Levels[lnum]
let SCORE = 0
let cdsecs = 0
let cd
let nextlvl
let PAUSED = false
let sudoPAUSED = false
let FOCUSED = true

// Audios

let hurt = newAudio("pop.wav", 0.01)
let block = newAudio("block.mp3", 0.05)
let ding = newAudio("powerup.mp3", 0.01)

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

        if (!FOCUSED) return

        if (!PAUSED) {
            if (!sudoPAUSED) { // Game related binds only
                if (keyClasses.shoot.includes(key)) {
                    HERO.shoot()
                }
            }
            if (keyClasses.pause.includes(key)) {
                sudoPAUSED = (!sudoPAUSED)
            }
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
    CTX.font = "50px Courier New"
    CTX.fillStyle = "white"
    CTX.fillText(`Clear! Incoming: Level ${lnum}`, (CANVAS.width / 2) - 200, (CANVAS.height / 2), 400)

    CTX.font = "30px Courier New"
    CTX.fillStyle = "yellow"
    CTX.fillText(`${(3 - cdsecs)}...`, (CANVAS.width / 2) - 10, (CANVAS.height / 2) + 50, 200)

    if (cdsecs == 3) {
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

const Imgs = {
    heart: newImg("heart.png"),
    heart_half: newImg("heart_half.png"),
    heart_empty: newImg("heart_empty.png"),
    armor: newImg("armor.png"),
    armor_half: newImg("armor_half.png"),
    armor_empty: newImg("armor_empty.png"),
    auto: newImg("auto.png"),
    bg: newImg("bg.png")
}

let HeartScale = 4
let HeartSize = 128
let ArmorScale = 1.68
let ArmorSize = 54
let AutoScale = powerupClasses.auto.scale

function newHeart(i, state = "heart", xo, yo, scale) {
    let size = HeartSize
    if (state.includes("armor")) size = ArmorSize

    const s = (size / scale)

    CTX.drawImage(Imgs[state], 0, 0, size, size, ((i * s) + xo), (((CANVAS.height) - s) + yo), s, s)
}

function drawHP(xo = 0, yo = 0) {
    // half a heart = 1 hp (Minecraft based system)

    const remainder = (maxes.hp - HERO.hp)
    const emptyHearts = Math.floor((remainder / 2))
    const halfHeart = (((remainder / 2) % 1) == 0.5)
    const fullHearts = (Math.floor(((maxes.hp / 2) - emptyHearts)) - ((halfHeart) && 1) || 0)

    let heartCount = 0

    for (let i = 0; (i < fullHearts); i++) {
        newHeart(heartCount, "heart", xo, yo, HeartScale)
        heartCount++
    }

    if (halfHeart) { // Only one half heart can exist
        newHeart(heartCount, "heart_half", xo, yo, HeartScale)
        heartCount++
    }

    for (let i = 0; (i < emptyHearts); i++) {
        newHeart(heartCount, "heart_empty", xo, yo, HeartScale)
        heartCount++
    }
}

function drawArmor(xo = 0, yo = 0) {
    // half a armor = 1 armor (Minecraft based system)

    const toFill = (maxes.armor - HERO.armor)
    
    if (toFill == 10) return // No armor, don't draw

    const halfArmor = (((toFill / 2) % 1) == 0.5)
    const fullArmors = (((maxes.armor / 2) - Math.floor((toFill / 2))) - (((halfArmor)) && 1) || 0)
    const emptyArmors = ((toFill / 2) - (((halfArmor)) && 1) || 0)

    let armorCount = 0

    for (let i = 0; (i < fullArmors); i++) {
        newHeart(armorCount, "armor", xo, yo, ArmorScale)
        armorCount++
    }

    if (halfArmor) { // Only one half armor can exist
        newHeart(armorCount, "armor_half", xo, yo, ArmorScale)
        armorCount++
    }

    for (let i = 0; (i < emptyArmors); i++) {
        newHeart(armorCount, "armor_empty", xo, yo, ArmorScale)
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

    if (!FOCUSED || PAUSED) return

    // Clear the canvas
    clearCanvas()

    // draw background
    CTX.drawImage(Imgs.bg, 0, 0, 600, 800, 0, 0, CANVAS.width, CANVAS.height)

    if (sudoPAUSED) {
        CTX.font = "50px Courier New"
        CTX.fillStyle = "white"
        CTX.fillText("Paused", (CANVAS.width / 2) - 100, (CANVAS.height / 2), 200)
        return
    }

    // create power-ups

    for (const c in level.powerUps) {
        const d = powerupClasses[c]

        if (!d) return // Non-existent power-up class

        if (randInt(1, level.powerUps[c]) == 1) {
            const set = ((d.smin) && randInt(d.smin, d.smax)) || d.s // If we have a min and max setter, then choose a random between them else the base setter
            const p = new Powerup(c, set, d.score, randInt(50, (CANVAS.width - 50)), randInt(50, 250), d.w, d.h, d.scale, d.dur)

            Powerups.push(p)
        }
    }

    // handle power-ups
    let pui = 0
    const fakePowerups = cloneArray(Powerups)
    for (const u of fakePowerups) {
        u.update()

        let pi = 0
        for (const p of Projectiles) {
            if (p.player) {
                if (checkCollision(u, p)) { // Projectile belongs to a player and hit a power-up
                    const t = u.type

                    if (HERO[t] != null) { // Stat based power-up
                        ding.play()

                        if (u.dur) { // Has a duration
                            const old = HERO[t]

                            setTimeout(function() {
                                HERO[t] = old
                            }, (u.dur * 1000))
                        }
    
                        let n = u.set
                        if (typeof(HERO[t]) == "number") { // Only call 'addStat' if the stat is a 'number' type
                            addStat(HERO, t, n)
                        }
                        else {
                            HERO[t] = n
                        }
                        
                        if (u.score) SCORE += u.score
                    }
                    else { // Isn't a power-up based on a stat

                    }
    
                    Powerups.splice(pui, 1)
                    Projectiles.splice(pi, 1)
                }   
            }
            pi++
        }
        pui++
    }
 
    // create bad guys

    for (const nm in level.enemyCounts) {
        if (level.enemiesSpawned[nm] < level.enemyCounts[nm]) { // Have all enemies spawned yet
            const c = enemyClasses[nm]

            if (!c) return // Non-existent enemy class

            const e = new Ship(nm, randInt(100, (CANVAS.width - 100)), randInt(50, 250), c.w, c.h, c.hp, c.xs, c.ys, c.sdata, c.scale, c.src)
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
                    if (HERO.armor <= 0) {
                        hurt.play()
                        HERO.hp -= p.damage
                    }
                    else {
                        block.play()
                        HERO.armor -= p.damage
                    }
                    
                    Projectiles.splice(pi, 1)
                }
            }
            else {
                // check enemy collision
                for (const e of Enemies) {
                    if (checkCollision(e, p)) {
                        e.hp -= p.damage
                        Projectiles.splice(pi, 1)
                        break // Prevents a projectile from wiping out potentially multiple bad guys
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

    const hasArmor = (HERO.armor > 0)
    if (hasArmor) {
        drawArmor(0, -(HeartSize / HeartScale))
    }  

    // handle auto

    if (HERO.auto) {
        HERO.shoot()
        CTX.drawImage(Imgs.auto, 0, 0, 275, 1274, (((HeartSize / HeartScale) * 5) + 10), (CANVAS.height - 80), (275 / AutoScale), (1274 / AutoScale))
    }

    // draw level

    CTX.font = "40px Courier New"
    CTX.fillStyle = "yellow"
    CTX.fillText(`Lvl: ${lnum}`, 0, (CANVAS.height - (128 / HeartScale)) - ((hasArmor) && (ArmorSize / ArmorScale)) || 0, 200)

    // draw score

    CTX.font = "40px Courier New"
    CTX.fillStyle = "white"
    CTX.fillText(SCORE, (CANVAS.width - 50), (CANVAS.height - 5), 200)

    // do lose condition

    if (HERO.hp <= 0) {
        PAUSED = true
        clearCanvas()

        CTX.font = "50px Courier New"
        CTX.fillStyle = "red"
        CTX.fillText("You died!", (CANVAS.width / 2) - 100, (CANVAS.height / 2), 200)

        CTX.fillStyle = "white"
        CTX.fillText(`Score: ${SCORE}`, (CANVAS.width / 2) - 100, (CANVAS.height / 2) + 85, 200)
        CTX.fillText(`Level: ${lnum}`, (CANVAS.width / 2) - 100, (CANVAS.height / 2) + 175, 200)
    }

    // do win condition
    
    if (Enemies.length == 0) {
        PAUSED = true
        clearCanvas()

        const r = level.rewards
        if (r) {
            for (const stat in r) {
                addStat(HERO, stat, r[stat])
            }
        }
        
        lnum++
        nextlvl = Levels[lnum]
        Projectiles.splice(0, Projectiles.length)

        if (nextlvl) {
            CTX.font = "50px Courier New"
            CTX.fillStyle = "white"
            CTX.fillText(`Clear! Incoming: Level ${lnum}`, (CANVAS.width / 2) - 200, (CANVAS.height / 2), 400)

            cd = setInterval(countDown, ((!DEBUG) && 1000) || 1)
        }
        else {
            CTX.font = "50px Courier New"
            CTX.fillStyle = "green"
            CTX.fillText("You win!", (CANVAS.width / 2) - 100, (CANVAS.height / 2), 200)

            if (HERO.hp == maxes.hp) {
                CTX.fillText("Perfect!", (CANVAS.width / 2) - 100, (CANVAS.height / 2) + 100, 200)
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
        globalThis.Powerups = Powerups

        CTX.fillStyle = "red"
        CTX.fillText("DEBUG MODE", 0, 35, 200)
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

    CTX.font = "40px Courier New"
    CTX.fillText("Mars Rescue Mission", (CANVAS.width / 2) - 185, (CANVAS.height / 2), 400)
    CTX.font = "20px Courier New"
    CTX.fillText(`Remastered v${version}`, (CANVAS.width / 2) - 75, (CANVAS.height / 2) + 25, 400)

    CTX.font = "25px Courier New"
    CTX.fillText("Press Space to play", (CANVAS.width / 2) - 135, (CANVAS.height / 2) + 100, 400)

    CTX.font = "25px Courier New"
    CTX.fillText("©2025 Passionyte", (CANVAS.width / 2) - 110, CANVAS.height - 50, 400)

    document.addEventListener("keydown", startgame)
}

if (!DEBUG) {
    spritescreen()
}
else {
    startgame(false)
}

export default { HERO }