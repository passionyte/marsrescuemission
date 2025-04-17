class Level {
    enemyCounts = {}
    enemiesSpawned = {}

    constructor(e) {
        this.enemyCounts = e

        for (const nm in e) {
            this.enemiesSpawned[nm] = 0
        }
    }
}

export const Levels = {
    1: new Level({
        generic: 10
    }),
    2: new Level({
        generic: 8,
        blue: 4
    }),
    3: new Level({
        generic: 4,
        blue: 6,
        pink: 2
    }),
    4: new Level({
        blue: 4,
        pink: 3,
        redblue: 2,
    }),
    5: new Level({
        blue: 1,
        pink: 1,
        redblue: 3,
        orangeyellow: 1,
    }),
    6: new Level({
        redblue: 2,
        orangeyellow: 2,
        pinkpurple: 1
    }),
    7: new Level({
        pink: 3,
        redblue: 1,
        orangeyellow: 3,
        pinkpurple: 2
    }),
}

export default { Levels }