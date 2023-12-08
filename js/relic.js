// Relic Stat Type
const Stat = {
    // Base Stats
    FLAT_HP: { name: "HP", scale: 0 },
    FLAT_ATK: { name: "攻撃力", scale: 0 },
    FLAT_DEF: { name: "防御力", scale: 0 },
    HP: { name: "HP(%)", scale: 1 },
    ATK: { name: "攻撃力(%)", scale: 1 },
    DEF: { name: "防御力(%)", scale: 1 },
    SPD: { name: "速度", scale: 0 },
    // Advanced Stats
    CRIT_RATE: { name: "会心率(%)", scale: 1 },
    CRIT_DMG: { name: "会心ダメージ(%)", scale: 1 },
    BREAK_EFFECT: { name: "撃破特攻(%)", scale: 1 },
    OUTGOING_HEALING_BOOST: { name: "Outgoing Healing Boost", scale: 1 },
    ENERGY_REGENERATION_RATE: { name: "Energy Regeneration Rate", scale: 1 },
    EFFECT_HIT_RATE: { name: "効果命中(%)", scale: 1 },
    EFFECT_RES: { name: "効果抵抗(%)", scale: 1 },
    ELEMENTAL_DMG_BOOST: { name: "Elemental DMG Boost", scale: 1},
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

// utility functions

function format(number, scale) {
    if (scale == 0) {
        return Math.floor(number).toString();
    }
    let s = Math.floor(number * Math.pow(10, scale)).toString();
    let p = s.length - scale;
    return s.slice(0, p) + "." + s.slice(p);
}

function sum(array) { return array.reduce((a,b) => a + b, 0); }

function first(array) { return array[0]; }

function last(array) { return array[array.length - 1]; }

function deduplicate(array) { return [...new Set(array)]; }
