// Passionyte 2025
'use strict'

import { Url } from "./globals.js"
import { findSetting } from "./settings.js"

export const Playing = {}

export function newSound(src, v, l) {
    const a = new Audio((Url + "snds/") + (((src) && src) || "pew.mp3"))
    a.volume = v || 0.1
    a.loop = (l)

    return a
}

export function playSound(a, n) {
    if (!findSetting(globalThis.Settings, "Sounds").value) return

    if (n) { // new/non-lingering audio
        let nw = newSound(a.src, a.volume || 0.01, a.loop || false)
        nw.play()

        Playing[nw] = true

        if (nw.loop) return
        setTimeout(function() {
            Playing[nw] = null
            nw = null
        }, (nw.duration * 1000))
    }
    else { // lingering audio
        if (Playing[a]) return
        a.play()

        setTimeout(function() {
            Playing[a] = false
        }, (a.duration * 1000))
    }
}

export default { newSound }