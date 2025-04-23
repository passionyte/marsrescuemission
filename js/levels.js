class Level {
    enemyCounts = {}
    enemiesSpawned = {}

    constructor(e, p) {
        this.enemyCounts = e
        this.powerUps = p

        for (const nm in e) {
            this.enemiesSpawned[nm] = 0
        }
    }
}

export const Levels = { // First array is enemies, second array is power-ups
    1: new Level(
        {
            generic: 10
        },
        {
            armor: 1500,
        }
    ),
    2: new Level(
        {
            generic: 8,
            blue: 4
        },
        {
            armor: 1400
        }
    ),
    3: new Level(
        {
            generic: 4,
            blue: 6,
            pink: 2
        },
        {
            armor: 1300
        }
    ),
    4: new Level(
        {
            blue: 4,
            pink: 3,
            redblue: 2,
        },
        {
            armor: 1200,
            auto: 2000
        }
    ),
    5: new Level(
        {
            blue: 1,
            pink: 1,
            redblue: 3,
            orangeyellow: 1,
        },
        {
            hp: 1000,
            armor: 1300,
            auto: 1500
        }
    ),
    6: new Level(
        {
            redblue: 2,
            orangeyellow: 2,
            pinkpurple: 1
        },
        {
            hp: 900,
            armor: 1250,
            auto: 1400
        }
    ),
    7: new Level(
        {
            pink: 3,
            redblue: 1,
            orangeyellow: 3,
            pinkpurple: 2
        },
        {
            hp: 800,
            armor: 1200,
            auto: 1300
        }
    ),
    8: new Level(
        {
            orangeyellow: 2,
            pinkpurple: 3,
        },
        {
            hp: 750,
            armor: 1100,
            auto: 1250
        }
    ),
    9: new Level(
        {
            minion: 5
        },
        {
            hp: 700,
            armor: 1000,
            auto: 1100
        }
    ),
    10: new Level(
        {
            boss: 1
        },
        {
            hp: 650,
            armor: 850,
            auto: 900
        }
    )
}

export default { Levels }