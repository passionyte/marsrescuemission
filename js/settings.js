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
    new Setting("Alternate Cooldown", "QOL", false),
    new Setting("Music", "Audio", true)
]

export function changeSetting(plrData, nm, val, ...rest) {
    for (const s of plrData.Settings) {
        if (s.name == nm) {
            s.value = val

            if (s.apply) s.apply(rest)
            
            break
        }
    }

    localStorage.setItem("MRMData", plrData)

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

export default { Settings }