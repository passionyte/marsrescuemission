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
}

export default { Levels }