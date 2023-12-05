// instead of enum class
const Stat = {
    // Base Stats
    FLAT_HP: { name: "HP", scale: 0 },
    FLAT_ATK: { name: "ATK", scale: 0 },
    FLAT_DEF: { name: "DEF", scale: 0 },
    HP: { name: "HP%", scale: 1 },
    ATK: { name: "ATK%", scale: 1 },
    DEF: { name: "DEF%", scale: 1 },
    SPD: { name: "SPD", scale: 0 },
    // Advanced Stats
    CRIT_RATE: { name: "CRIT Rate%", scale: 1 },
    CRIT_DMG: { name: "CRIT DMG%", scale: 1 },
    BREAK_EFFECT: { name: "Break Effect%", scale: 1 },
//    OUTGOING_HEALING_BOOST: { name: "Outgoing Healing Boost", scale: 1 },
//    ENERGY_REGENERATION_RATE: { name: "Energy Regeneration Rate", scale: 1 },
    EFFECT_HIT_RATE: { name: "Effect Hit Rate%", scale: 1 },
    EFFECT_RES: { name: "Effect RES%", scale: 1 },
//    ELEMENTAL_DMG_BOOST: { name: "Elemental DMG Boost", scale: 1},
}

class SubStat {
    constructor(stat, log) {
        this.stat = stat;
        this.log = log;
    }

    get value() {
        let v = 0;
        let power = 1000;
        SubStat.getInitialValues(this.stat).forEach((val, idx) => {
            v += power * val * this.log[idx];
        });
        return Math.floor(v) / power;
    }

    // return value in game
    get formattedValue() { return format(this.value, this.stat.scale); }

    equals(o) { return this.stat == o.stat && sum(this.log) == sum(o.log) && this.value == o.value; }
    
    // get values for initial or increase
    static getInitialValues(stat) {
        switch (stat) {
            case Stat.FLAT_HP: return [33.87, 38.103755, 42.33751];
            case Stat.FLAT_ATK: return [16.935, 19.051877, 21.168754];
            case Stat.FLAT_DEF: return [16.935, 19.051877, 21.168754];
            case Stat.HP: return [3.456, 3.888, 4.32];
            case Stat.ATK: return [3.456, 3.888, 4.32];
            case Stat.DEF: return [4.32, 4.86, 5.4];
            case Stat.SPD: return [2.0, 2.3, 2.6];
            case Stat.CRIT_RATE: return [2.592, 2.916, 3.24];
            case Stat.CRIT_DMG: return [5.184, 5.832, 6.48];
            case Stat.BREAK_EFFECT: return [5.184, 5.832, 6.48];
            case Stat.EFFECT_HIT_RATE: return [3.456, 3.888, 4.32];
            case Stat.EFFECT_RES: return [3.456, 3.888, 4.32];
            default: return undefined;
        }
    }
}

class PossibleSubStat {
    constructor(stat) {
        this.all = PossibleSubStat.#COMBINATIONS
                .map(it => new SubStat(stat, it))
                .sort((a, b) => a.value - b.value);
    }

    get min() { return first(this.all); }
    get max() { return last(this.all); }

    static #COMBINATIONS = [ // 83 combinations
        [1,0,0],[0,1,0],[0,0,1],[2,0,0],[1,1,0],[1,0,1],[0,2,0],[0,1,1],[0,0,2],[3,0,0],
        [2,1,0],[2,0,1],[1,2,0],[1,1,1],[1,0,2],[0,3,0],[0,2,1],[0,1,2],[0,0,3],[4,0,0],
        [3,1,0],[3,0,1],[2,2,0],[2,1,1],[2,0,2],[1,3,0],[1,2,1],[1,1,2],[1,0,3],[0,4,0],
        [0,3,1],[0,2,2],[0,1,3],[0,0,4],[5,0,0],[4,1,0],[4,0,1],[3,2,0],[3,1,1],[3,0,2],
        [2,3,0],[2,2,1],[2,1,2],[2,0,3],[1,4,0],[1,3,1],[1,2,2],[1,1,3],[1,0,4],[0,5,0],
        [0,4,1],[0,3,2],[0,2,3],[0,1,4],[0,0,5],[6,0,0],[5,1,0],[5,0,1],[4,2,0],[4,1,1],
        [4,0,2],[3,3,0],[3,2,1],[3,1,2],[3,0,3],[2,4,0],[2,3,1],[2,2,2],[2,1,3],[2,0,4],
        [1,5,0],[1,4,1],[1,3,2],[1,2,3],[1,1,4],[1,0,5],[0,6,0],[0,5,1],[0,4,2],[0,3,3],
        [0,2,4],[0,1,5],[0,0,6]
    ];
}

// data

const possibleSubStats = [
    Stat.FLAT_HP,
    Stat.FLAT_ATK,
    Stat.FLAT_DEF,
    Stat.HP,
    Stat.ATK,
    Stat.DEF,
    Stat.SPD,
    Stat.CRIT_RATE,
    Stat.CRIT_DMG,
    Stat.BREAK_EFFECT,
    Stat.EFFECT_HIT_RATE,
    Stat.EFFECT_RES
].map(it => new PossibleSubStat(it));

// utility functions

function format(number, scale) {
    if (scale == 0) {
        return Math.floor(number).toString();
    }
    let s = Math.floor(number * Math.pow(10, scale)).toString();
    let p = s.length - scale;
    return s.slice(0, p) + "." + s.slice(p);
}

function sum(numbers) {
    return numbers.reduce((a,b) => a + b, 0);
}

function first(array) {
    return array[0];
}

function last(array) {
    return array[array.length - 1];
}

function deduplicate(array) {
    return [...new Set(array)];
}
