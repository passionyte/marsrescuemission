import { newImg } from "./globals.js"

class Ship {
    position = {
        x: 0,
        y: 0
    }

    velocity = {
        x: 0,
        y: 0
    }

    img = newImg()
    hp

    constructor(x, y, hp) {
        this.position.x = x
        this.position.y = y
        this.hp = hp
    }
}

export default class Player extends Ship {

    constructor(x, y, hp) {
        super(x, y, hp)
    }
}