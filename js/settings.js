// Passionyte 2025

'use strict'

import { restartGame } from "./main.js"
import { Playing } from "./sounds.js"

class Setting {
    name
    type
    from
    value
    apply
    desc

    constructor(name, from, def, desc = "", func) {
        this.name = name
        this.from = from
        this.type = typeof(def)
        this.value = def
        this.apply = func
        this.desc = desc
    }
}

export const Settings = [ // Default settings
    // QOL
    new Setting("Alternate Countdown", "QOL", false, "Toggles press space to continue instead of a countdown"),
    // Difficulty
    new Setting("Hardcore", "Difficulty", false, "Start with only half a heart, but get double the score (This will restart your game)", function(val) {
        restartGame()
    }),
    // Audio
    new Setting("Music", "Audio", true, "Toggles music", function(val) {
        if (val) {
            globalThis.Music.play()
        }
        else {
            globalThis.Music.pause()
        }
    }),
    new Setting("Sounds", "Audio", true, "Toggles sound effects", function(val) {
        if (val) {
            for (const a in Playing) {
                if (!a.paused && a.pause) {
                    a.pause()
                }
            }
        }
        else {
            for (const a in Playing) {
                if (a.paused && a.play) {
                    a.play()
                }
            }
        }
    })
]

export function getSettingClasses() {
    let c = []

    for (const s of Settings) {
        if (!c[s.from]) {
            c.push(s.from)
        }
    }

    return c
}

export function changeSetting(plrData, nm, val, ...rest) {
    for (let s in plrData.Settings) {
        s = plrData.Settings[s]
        if (s.name == nm) {
            s.value = val

            const rs = findSetting(Settings, nm)
            if (rs.apply) rs.apply(val, rest)
            
            break
        }
    }

    return plrData
}

export function findSetting(f, nm) {
    let result

    for (let s in f) {
        s = f[s]

        if (s.name == nm) {
            result = s
            break
        }
    }

    return result
}

export function getSettingsFromClass(c) {
    const result = []

    for (const s of Settings) {
        if (s.from == c) {
            result.push(s)
        }
    }

    return result
}

export function computeDefault() {
    let result = []

    for (const s of Settings) {
        result.push({
            name: s.name,
            value: s.value
        })
    }

    return result
}

export default { Settings }