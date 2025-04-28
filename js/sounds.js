// Passionyte 2025
'use strict'

import { Url } from "./globals.js"

export const Playing = []

export const Sounds = {}

export function newSound(src, v, l) {
    const a = new Audio((Url + "snds/") + (((src) && src) || "pew.mp3"))
    a.volume = v || 0.1
    a.loop = (l)

    return a
}

export function playSound(a, n) {
    if (!globalThis.Settings.Sounds) console.log("Death"); return

    if (n) {
        const nw = newSound(a.src, a.volume || 0.01, a.loop || false)
        nw.play()

        let i = nw.length
        Playing.push(nw)

        if (nw.loop) return
        setTimeout(function() {
            nw = null
            Playing.splice(i, 1)
        }, (nw.duration * 1000))
    }
    else {
        a.play()
        Playing.push(a)
    }
}

export default { newSound }