// Passionyte 2025

'use strict'

class Level {
    enemyCounts = {}
    enemiesSpawned = {}

    resetSpawned() {
        for (const nm in this.enemyCounts) {
            this.enemiesSpawned[nm] = 0
        }
    }

    constructor(e, p, r) {
        this.enemyCounts = e
        this.powerUps = p
        this.rewards = r

        this.resetSpawned()
    }
}

export const Levels = { // First array is enemies, second array is power-ups, third array is rewards
    1: new Level(
        {
            generic: 10
        },
        {
            armor: 1400,
            xspeed: 2000
        }
    ),
    2: new Level(
        {
            generic: 8,
            blue: 4
        },
        {
            armor: 1300,
            xspeed: 1800,
        }
    ),
    3: new Level(
        {
            generic: 4,
            blue: 6,
            pink: 2
        },
        {
            armor: 1250,
            xspeed: 1600
        }
    ),
    4: new Level(
        {
            blue: 4,
            pink: 3,
            redblue: 2,
        },
        {
            hp: 1250,
            armor: 1200,
            auto: 2000,
            xspeed: 1500
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
            armor: 1150,
            auto: 1500,
            xspeed: 1300,
        },
        {
            armor: 2
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
            armor: 1100,
            auto: 1400,
            xspeed: 1250
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
            armor: 1050,
            auto: 1300,
            xspeed: 1200
        }
    ),
    8: new Level(
        {
            orangeyellow: 2,
            pinkpurple: 3,
        },
        {
            hp: 750,
            armor: 1000,
            auto: 1250,
            xspeed: 1150
        }
    ),
    9: new Level(
        {
            minion: 5
        },
        {
            hp: 700,
            armor: 900,
            auto: 1100,
            xspeed: 1100
        }
    ),
    10: new Level(
        {
            boss: 1
        },
        {
            hp: 650,
            armor: 850,
            auto: 900,
            xspeed: 1000
        },
        {
            hp: 5,
            armor: 5
        }
    ),
    11: new Level(
        {
            spectral: 5
        },
        {
            hp: 500,
            armor: 750,
            auto: 1000,
            xspeed: 950
        }
    ),
    12: new Level(
        {
            spectral: 3,
            ghost: 2
        },
        {
            hp: 600,
            armor: 800,
            auto: 950,
            xspeed: 900
        }
    ),
    13: new Level(
        {
            spectral: 2,
            ghost: 3,
            magma: 1
        },
        {
            hp: 550,
            armor: 750,
            auto: 900,
            xspeed: 850
        }
    ),
    14: new Level(
        {
            spectral: 1,
            ghost: 2,
            magma: 3
        },
        {
            hp: 500,
            armor: 700,
            auto: 850,
            xspeed: 800
        },
        {
            hp: 1,
            armor: 1
        }
    ),
    15: new Level(
        {
            boss: 1,
            minion: 3
        },
        {
            hp: 475,
            armor: 650,
            auto: 800,
            xspeed: 750
        },
        {
            hp: 6,
            armor: 6
        }
    ),
    16: new Level(
        {
            darkblue: 1,
            purple: 1
        },
        {
            hp: 450,
            armor: 625,
            auto: 750,
            xspeed: 700
        },
        {
            hp: 1,
            armor: 1
        }
    ),
    17: new Level(
        {
            darkblue: 2,
            purple: 3
        },
        {
            hp: 425,
            armor: 600,
            auto: 725,
            xspeed: 675
        },
        {
            hp: 1,
            armor: 1
        }
    )
}

export default { Levels }