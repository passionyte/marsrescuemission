// Passionyte 2025

'use strict'

import { DEBUG, MS_PER_FRAME, CANVAS, CTX, keyClasses, randInt, clearCanvas, newImg, cloneArray, version, clearArray, d } from "./globals.js"
import { Ship, Player, Enemies, enemyClasses, addStat } from "./player.js"
import { Projectiles, checkCollision } from "./projectile.js"
import { Levels } from "./levels.js"
import { Powerup, powerupClasses, Powerups } from "./powerup.js"
import { Settings, changeSetting, findSetting, getSettingClasses, getSettingsFromClass, computeDefault } from "./settings.js"
import { newSound, playSound } from "./sounds.js"

// Variables

let frame_time = performance.now()

const maxes = {
    hp: 10,
    armor: 10
}

const endX = CANVAS.width
const endY = CANVAS.height
const cenX = (endX / 2)
const cenY = (endY / 2)

export const HERO = new Player(
    {
        x: cenX, 
        y: (endY - 100), 
        w: 388, 
        h: 299, 
        hp: maxes.hp, 
        armor: 0,
        src: "ship.png",
        xs: 8,
        ys: 0,
        scale: 4
    }
)
let lnum = 1
let level = Levels[lnum]
let SCORE = 0
let cdsecs = 0
let cd
let nextlvl
let PAUSED = false
let sudoPAUSED = false
let FOCUSED = true

// Player Data Handling 

export let plrData = JSON.parse(localStorage.getItem("MRMData")) || {
    Settings: computeDefault(),
    HighScore: 0
}
globalThis.Settings = plrData.Settings

function saveData() {
    localStorage.setItem("MRMData", JSON.stringify(plrData))
}

// Add missing settings
let changed = false

for (const s of Settings) {
    if (!findSetting(plrData.Settings, s.name)) plrData.Settings.push(s); changed = true
}

if (changed) saveData()

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

function continueGame(key) {
    if (key) {
        if (!keyClasses.shoot.includes(key.keyCode)) return
        document.removeEventListener("keydown", continueGame)
    }

    if (cd) clearInterval(cd); cd = null

    cdsecs = 0
    level = nextlvl

    HERO.velocity.x = 0
    HERO.position.x = cenX
    PAUSED = false
}

function countDown(alt) {
    clearCanvas()

    CTX.textAlign = "center"

    CTX.font = "40px PressStart2P"
    CTX.fillStyle = "white"
    CTX.fillText(`Clear! Incoming: Level ${lnum}`, cenX, cenY, 400)

    CTX.font = "25px PressStart2P"
    CTX.fillStyle = "yellow"
    if (!alt) {
        CTX.fillText(`${(3 - cdsecs)}...`, cenX, cenY + 50, 200)
    
        if (cdsecs == 3) continueGame()
    
        cdsecs++
    }
    else {
        CTX.fillText("Press Space to continue", cenX, cenY + 50, 400)

        document.addEventListener("keydown", continueGame)
    }
}

function restartGame(key) {
    if (!keyClasses.shoot.includes(key.keyCode)) return

    SCORE = 0
    lnum = 1
    level = Levels[lnum]
    // nextlvl = level

    level.enemiesSpawned = {}
    for (const nm in level.enemyCounts) {
        level.enemiesSpawned[nm] = 0
    }

    // Reset hero
    HERO.position.x = cenX
    HERO.position.y = (endY - 100)
    HERO.velocity.x = 0
    HERO.velocity.y = 0
    HERO.hp = 10//maxes.hp
    HERO.armor = 0
    HERO.xs = 8
    HERO.auto = false

    clearArray(Enemies)
    clearArray(Projectiles)
    clearArray(Powerups)

    PAUSED = false

    document.removeEventListener("keydown", restartGame)

    update()
}

// Sound initiations
const Music = newSound("groovy.mp3", 0.025, true)
newSound("block.mp3")
newSound("boom.wav")
newSound("break.mp3")
newSound("pew.mp3")
newSound("pop.wav")
newSound("powerup.mp3")

globalThis.Music = Music

// Image initiations

const Imgs = {
    heart: newImg("heart.png"),
    heart_half: newImg("heart_half.png"),
    heart_empty: newImg("heart_empty.png"),
    armor: newImg("armor.png"),
    armor_half: newImg("armor_half.png"),
    armor_empty: newImg("armor_empty.png"),
    auto: newImg("auto.png"),
    bg: newImg("bg.png"),
    speed: newImg("speed.png")
}

let HeartScale = 4
let HeartSize = 128
let ArmorScale = 1.68
let ArmorSize = 54
// let AutoScale = powerupClasses.auto.scale

function newHeart(i, state = "heart", xo, yo, scale) {
    let size = HeartSize
    if (state.includes("armor")) size = ArmorSize

    const s = (size / scale)

    CTX.drawImage(Imgs[state], 0, 0, size, size, ((i * s) + xo), (((endY) - s) + yo), s, s)
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
    CTX.drawImage(Imgs.bg, 0, 0, 600, 800, 0, 0, endX, endY)

    if (sudoPAUSED) {
        CTX.textAlign = "center"
        CTX.font = "50px PressStart2P"
        CTX.fillStyle = "white"
        CTX.fillText("Paused", cenX, cenY, 200)
        return
    }

    // create power-ups

    for (const c in level.powerUps) {
        const d = powerupClasses[c]

        if (!d) return // Non-existent power-up class

        if (randInt(1, level.powerUps[c]) == 1) {
            const set = ((d.smin) && randInt(d.smin, d.smax)) || d.s // If we have a min and max setter, then choose a random between them else the base setter
            const p = new Powerup(c, set, d.score, randInt(50, (endX - 50)), randInt(50, 250), d.w, d.h, d.scale, d.dur)

            Powerups.push(p)
        }
    }

    // handle power-ups
    let pui = 0
    let fakePowerups = cloneArray(Powerups)
    for (const u of fakePowerups) {
        u.update()

        let pi = 0
        for (const p of Projectiles) {
            if (p.player) {
                if (checkCollision(u, p)) { // Projectile belongs to a player and hit a power-up
                    const t = u.type

                    if (HERO[t] != null) { // Stat based power-up
                        playSound({src: "powerup.mp3", volume: 0.03}, true)

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
    fakePowerups = null
    pui = null
 
    // create bad guys

    for (const nm in level.enemyCounts) {
        if (level.enemiesSpawned[nm] < level.enemyCounts[nm]) { // Have all enemies spawned yet
            const c = enemyClasses[nm]

            if (!c) return // Non-existent enemy class

            const e = new Ship(nm, {
                x: randInt(100, (endX - 100)),
                y: randInt(50, 250), 
                w: c.w, 
                h: c.h,
                hp: c.hp,
                xs: c.xs,
                ys: c.ys,
                scale: c.scale,
                src: c.src,
                score: c.score,
                bar: (c.bar),
                barcolor: c.barcolor
            }, c.sdata)
            Enemies.push(e)

            level.enemiesSpawned[nm]++
        }
    }

    // handle bad guys

    let ei = 0
    let fakeEnemies = cloneArray(Enemies) // Fixes that flickering issue

    for (const e of fakeEnemies) {
        if (e.hp <= 0) { // Death
            playSound(e.boom)
            Enemies.splice(ei, 1)   

            SCORE += ((e.score) && e.score) || 1
        }
        else { // Very simple AI
            if (!e.varspeed) e.varspeed = -e.xspeed
            e.velocity.x = e.varspeed
            e.velocity.y = e.yspeed

            e.update()

            if (e.sdata) { // Has projectiles
                const coold = (e.sdata.cooldown * 1000)

                if ((NOW - e.last_shot) > (coold + ((randInt(0.1, 0.4) - 0.1) * coold))) { // Make sure we follow the cooldown here
                    e.shoot()
                }
            }

            if (e.bar) { // Has large HP Bar (intended for single boss usage)
                CTX.fillStyle = "darkgray"
                CTX.fillRect(10, 10, 580, 50)
                CTX.fillStyle = e.barcolor
                CTX.fillRect(10, 10, (580 * (e.hp / e.maxhp)), 50)
            }

            if (checkCollision(HERO, e)) HERO.hp = 0 // Touching the player kills them
        }
        ei++
    }
    fakeEnemies = null
    ei = null

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
                        playSound({src: "pop.wav", volume: 0.05}, true)
                        addStat(HERO, "hp", -p.damage)
                    }
                    else {
                        playSound({src: "block.mp3", volume: 0.1}, true)
                        addStat(HERO, "armor", -p.damage)

                        if (HERO.armor <= 0) playSound({src: "break.mp3", volume: 0.1}, true)
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
    pi = null

    // draw player

    HERO.velocity.x = ((downClasses.left) && -HERO.xspeed || (downClasses.right) && HERO.xspeed) || 0
    HERO.update()

    // draw hp

    drawHP()

    // draw armor

    const hasArmor = (HERO.armor > 0)
    if (hasArmor) drawArmor(0, -(HeartSize / HeartScale))

    // handle auto

    if (HERO.auto) {
        HERO.shoot()
        // CTX.drawImage(Imgs.auto, 0, 0, 275, 1274, (((HeartSize / HeartScale) * 5) + 10), (endY - 80), (275 / AutoScale), (1274 / AutoScale))
    }

    // draw level

    CTX.textAlign = "left"
    CTX.font = "30px PressStart2P"
    CTX.fillStyle = "yellow"
    CTX.fillText(`Lvl: ${lnum}`, 0, (endY - (128 / HeartScale)) - ((hasArmor) && (ArmorSize / ArmorScale)) || 0, 200)

    // draw score

    CTX.textAlign = "right"
    CTX.font = "30px PressStart2P"
    CTX.fillStyle = "white"
    CTX.fillText(SCORE, endX, (endY - 5), 200)

    // do lose condition

    if (HERO.hp <= 0) {
        PAUSED = true
        clearCanvas()

        CTX.textAlign = "center"

        CTX.font = "45px PressStart2P"
        CTX.fillStyle = "red"
        CTX.fillText("You died!", cenX, cenY, 200)

        CTX.font = "40px PressStart2P"
        CTX.fillStyle = "white"
        CTX.fillText(`Score: ${SCORE}`, cenX, cenY + 85, 200)
        CTX.fillText(`Level: ${lnum}`, cenX, cenY + 175, 200)

        CTX.font = "20px PressStart2P"
        CTX.fillText("Press Space to restart", cenX, endY - 50, 400)

        document.addEventListener("keydown", restartGame)

        if (SCORE > plrData.HighScore) {
            plrData.HighScore = SCORE
            saveData()

            CTX.fillStyle = "yellow"
            CTX.font = "15px PressStart2P"
            CTX.fillText("New High Score!", cenX, cenY + 235, 400)
        }

        CTX.fillStyle = "white"
        CTX.font = "15px PressStart2P"

        CTX.fillText(`HI: ${plrData.HighScore}`, cenX, cenY + 265, 200)
    }
    else if (Enemies.length == 0 && (SCORE > 0)) { // do win condition
        PAUSED = true
        clearCanvas()

        const r = level.rewards
        if (r) {
            for (const stat in r) { // Bonuses for completing certain levels
                addStat(HERO, stat, r[stat])
            }
        }
        
        lnum++
        nextlvl = Levels[lnum]
        clearArray(Projectiles)

        CTX.textAlign = "center"
        CTX.font = "40px PressStart2P"

        if (nextlvl) {
            CTX.fillStyle = "white"
            CTX.fillText(`Clear! Incoming: Level ${lnum}`, cenX, cenY, 400)

            const alt = findSetting(plrData.Settings, "Alternate Countdown").value

            if (!alt) {
                cd = setInterval(countDown, ((!DEBUG) && 1000) || 1)
            }
            else {
                countDown(true)
            }
        }
        else {
            CTX.font = "45px PressStart2P"
            CTX.fillStyle = "green"
            CTX.fillText("You win!", cenX, cenY, 200)

            CTX.font = "40px PressStart2P"

            if (HERO.hp == maxes.hp) {
                CTX.fillText("Perfect!", cenX, cenY + 100, 200)
            }
            else {
                CTX.fillStyle = "white"
                CTX.fillText("HP remaining:", cenX, cenY + 80, 200)

                drawHP(cenX - 85, -250)
            }

            CTX.fillStyle = "white"
            CTX.fillText(`Score: ${SCORE}`, cenX, cenY + 220, 200)

            CTX.font = "20px PressStart2P"
            CTX.fillText("Press Space to restart", cenX, endY - 50, 400)

            document.addEventListener("keydown", restartGame)

            if (SCORE > plrData.HighScore) {
                plrData.HighScore = SCORE
                saveData()

                CTX.fillStyle = "yellow"
                CTX.font = "20px PressStart2P"
                CTX.fillText("New High Score!", cenX, cenY + 250, 400)
            }

            CTX.fillStyle = "white"
            CTX.font = "15px PressStart2P"

            CTX.fillText(`HI: ${plrData.HighScore}`, cenX, cenY + 280, 200)
        }
    }
    
    // do debug stuff

    if (DEBUG) {
        globalThis.HERO = HERO
        globalThis.Projectiles = Projectiles
        globalThis.Enemies = Enemies
        globalThis.Powerups = Powerups
        globalThis.plrData = plrData
        globalThis.level = level

        CTX.textAlign = "left"
        CTX.fillStyle = "red"
        CTX.fillText("DEBUG MODE", 0, 35, 200)
    }
}

function startGame(ev) {
    if (!ev || (keyClasses.shoot.includes(ev.keyCode))) {
        document.removeEventListener("keydown", startGame)

        if (findSetting(plrData.Settings, "Music").value) Music.play()

        update()
        input()
    }
}

function spritescreen() {
    CTX.fillStyle = "white"

    CTX.textAlign = "center"

    CTX.font = "30px PressStart2P"
    CTX.fillText("Mars Rescue Mission", cenX, cenY, 400)
    
    CTX.font = "10px PressStart2P"
    CTX.fillText(`Remastered v${version}`, cenX, cenY + 25, 400)

    CTX.font = "15px PressStart2P"
    CTX.fillText("Press Space to play", cenX, cenY + 100, 400)

    CTX.font = "15px PressStart2P"
    CTX.fillText("©2025 Passionyte", cenX, endY - 50, 400)

    document.addEventListener("keydown", startGame)
}

if (!DEBUG) {
    spritescreen()
}
else {
    startGame(false)
}

// site stuff

for (const c of getSettingClasses()) {
    if (!d("settings").querySelector(`#${c}`)) {
        const fs = d("fsdummy").cloneNode(true)

        fs.id = c
        fs.querySelector("#from").innerText = c
        
        for (const s of getSettingsFromClass(c)) {
            const se = fs.querySelector("#sdummy").cloneNode(true)
            se.id = s.name

            const l = se.querySelector("#ldummy")
            l.id = "label"
            l.innerHTML = `${s.name}:`

            const i = se.querySelector("#idummy")
            i.id = "input"
            i.type = ((s.type == "boolean") && "checkbox") || ""

            const e = findSetting(plrData.Settings, s.name) || findSetting(Settings, s.name)

            se.querySelector("#sdesc").innerHTML = s.desc

            // disregard warnings, e should always exist   
            if (i.type == "checkbox") { 
                i.checked = (e.value)

                i.addEventListener("change", function() {
                    plrData = changeSetting(plrData, s.name, i.checked)
                    globalThis.Settings = plrData.Settings
                    saveData()
                })
            }
            else {
                i.value = e.value
            }

            fs.appendChild(se)
        }

        fs.removeChild(fs.querySelector("#sdummy")) // this had me confused for a while lol

        fs.hidden = false
        d("settings").appendChild(fs)
    }
}

// prevent certain browser controls

document.addEventListener("contextmenu", ev => {
    ev.preventDefault()
})

window.addEventListener("keydown", function(e) {
    // Check if the pressed key is the left or right arrow key
    if ([37, 39].indexOf(e.keyCode) > -1 || (e.keyCode == 32 && e.target == document.body || e.target.type == "checkbox")) {
      e.preventDefault(); // Prevent the default scrolling behavior
    }
  }, false);

export default { HERO }