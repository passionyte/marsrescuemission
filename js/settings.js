// Passionyte 2025

'use strict'

class Setting {
    name
    type
    from
    value
    apply

    constructor(name, from, def, func) {
        this.name = name
        this.from = from
        this.type = typeof(def)
        this.value = def
        this.apply = func
    }
}

export const Settings = [ // Default settings
    new Setting("Alternate Countdown", "QOL", false),
    new Setting("Music", "Audio", true, function(val) {
        if (val) {
            globalThis.Music.play()
        }
        else {
            globalThis.Music.pause()
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

    localStorage.setItem("MRMData", JSON.stringify(plrData))

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

export default { Settings }