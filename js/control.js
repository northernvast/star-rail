const MAX_SELECTABLE_COUNT = 4;

let checkboxes = [];
function onChange(event) {
    let checkbox = event.target;
    if (checkbox.checked) {
        if (checkboxes.length >= MAX_SELECTABLE_COUNT) {
            checkbox.checked = false;
            return;
        }
        checkboxes.push(checkbox);
    } else {
        checkboxes = checkboxes.filter(it => it != checkbox);
    }
    checkboxes.forEach((it, idx) => it.nextElementSibling.textContent = idx + 1);
    subStats = checkboxes.map(it => Stat[it.value]);
    updateSubStatValuesInGame();
    updateSubStatValuesInGroup()
}

document.getElementById("sub-stat-options")
        .querySelectorAll("input")
        .forEach(it => it.addEventListener("change", onChange));

class SubStatSelector {
    constructor(stat, deduplicate) {
        this.stat = stat;
        let all = SubStatSelector.#COMBINATIONS
                .map(it => new SubStat(stat, it))
                .sort((a, b) => a.value - b.value);
        if (deduplicate) {
            all = all.filter((a, pos) => all.findIndex(b => a.equals(b)) == pos);
        }
        this.groups = [];
        let group = [];
        let prev = "";
        all.forEach((subStat, idx) => {
            let current = subStat.formattedValue;
            if (idx != 0 && prev != current) {
                this.groups.push(group);
                group = [];
            }
            group.push(subStat);
            prev = current;
        });
        this.groups.push(group);
    }

    cursor = [0, 0];

    get min() { return first(first(this.groups)); }
    get max() { return last(last(this.groups)); }
    get current() { return this.groups[this.cursor[0]][this.cursor[1]]; }

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

const list = [
    Stat.FLAT_HP, Stat.FLAT_ATK, Stat.FLAT_DEF,
    Stat.HP, Stat.ATK, Stat.DEF, Stat.SPD,
    Stat.CRIT_RATE, Stat.CRIT_DMG,
    Stat.BREAK_EFFECT, Stat.EFFECT_HIT_RATE, Stat.EFFECT_RES
];


let pool;
{
    let valueOptions = document.getElementById("sub-stat-value-options");
    pool = {
        labels: valueOptions.querySelectorAll(".label-text"),
        selects: valueOptions.querySelectorAll("select"),
        groups: valueOptions.querySelectorAll(".sub-stat-values-in-group")
    }
}

let selectors = list.map(it => new SubStatSelector(it, false));

let subStats = [];

function clear(e) {
    while (e.firstChild != null) { e.removeChild(e.firstChild); }
}

function createElemWithText(tagName, text) {
    let e = document.createElement(tagName);
    e.appendChild(document.createTextNode(text));
    return e;
}

function createElemWithClass(tagName, className) {
    let e = document.createElement(tagName);
    e.classList.add(className);
    return e;
}

function updateSubStatValuesInGame() {
    subStats.map(stat => selectors.find(it => it.stat == stat)).forEach((selector, index) => {
        pool.labels[index].textContent = selector.stat.name;
        clear(pool.selects[index]);
        selector.groups.forEach(it => {
          let op = createElemWithText("option", first(it).formattedValue);
          pool.selects[index].appendChild(op);
        });
        pool.selects[index].selectedIndex = selector.cursor[0];
    });
    for (let index = subStats.length; index < MAX_SELECTABLE_COUNT; index++) {
        pool.labels[index].textContent = "";
        clear(pool.selects[index]);
    }
}

function onSelectChange(index) {
    let selector = selectors.find(it => it.stat == subStats[index]);
    selector.cursor[0] = pool.selects[index].selectedIndex;
    updateSubStatValuesInGroup();
}

pool.selects.forEach((it, idx) => it.addEventListener("change", () => { onSelectChange(idx) }));

function updateSubStatValuesInGroup() {
    subStats.map(stat => selectors.find(it => it.stat == stat)).forEach((selector, index) => {
        clear(pool.groups[index]);
        selector.groups[selector.cursor[0]].forEach((sub, idx) => {
            let label = document.createElement("label");
            label.appendChild(createElemWithText("span", sub.value));
            let radio = document.createElement("input");
            radio.setAttribute("type", "radio");
            radio.setAttribute("name", "stat" + index);
            if (idx == selector.cursor[1]) { radio.checked = true; }
            radio.addEventListener("change", () => {
                if (radio.checked) {
                    selector.cursor[1] = idx;
                }
            });
            label.appendChild(radio);
            let graph = createElemWithClass("div", "horizontal-stacked-bar");
            for (let i = 2; i >= 0; i--) {
                repeat(sub.log[i], () => {
                    let bar = document.createElement("div");
                    switch (i) {
                        case  0: bar.classList.add("low-bar"); break;
                        case  1: bar.classList.add("med-bar"); break;
                        default: bar.classList.add("high-bar"); break;
                    }
                    graph.appendChild(bar);
                });
            }
            label.appendChild(graph);
            pool.groups[index].appendChild(label);
        });
    });
    for (let index = subStats.length; index < MAX_SELECTABLE_COUNT; index++) {
        clear(pool.groups[index]);
    }
}

function repeat(times, func) {
    for (let i = 0; i < times; i++) { func(); }
}

document.getElementById("deduplicate").addEventListener("change", (e) => {
    let newSelectors;
    if (e.target.checked) {
        newSelectors = list.map(it => new SubStatSelector(it, true));
    } else {
        newSelectors = list.map(it => new SubStatSelector(it, false));
    }
    for (let i = 0; i < list.length; i++) {
        let cursor = selectors[i].cursor;
        newSelectors[i].cursor[0] = cursor[0];
        target = selectors[i].current;
        newSelectors[i].cursor[1] = newSelectors[i].groups[cursor[0]].findIndex(it => target.equals(it))
    }
    selectors = newSelectors;
    updateSubStatValuesInGame();
    updateSubStatValuesInGroup()
});

document.getElementById("dark-mode").addEventListener("change", (e) => {
    document.body.classList.toggle("dark");
});
