'use strict'

import { FPS, DEBUG, MS_PER_FRAME, CANVAS, CTX } from "./globals.js"

let frame_time = performance.now()

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
}
update()