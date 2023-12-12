const MAX_SELECTABLE_COUNT = 4;

let checkboxes = [];
let stats = [];

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
    stats = checkboxes.map(it => Stat[it.value]);
    updateSubStatValuesInGame();
    updateSubStatValuesInGroup()
}

document.getElementById("sub-stat-options")
        .querySelectorAll("input")
        .forEach(it => it.addEventListener("change", onChange));

class Select {
    constructor(stat, deduplicate) {
        this.stat = stat;
        this.deduplicate = deduplicate;
        let all = SubStat.createAll(stat);
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

    toggle() {
        let newSelect = new Select(this.stat, !this.deduplicate);
        newSelect.cursor[0] = this.cursor[0];
        newSelect.cursor[1] = newSelect.groups[this.cursor[0]].findIndex(it => this.current.equals(it));
        return newSelect;
    }
}

let view;
{
    let viewSubStats = document.getElementById("sub-stat-value-options");
    view = {
        labels: viewSubStats.querySelectorAll(".label-text"),
        selects: viewSubStats.querySelectorAll("select"),
        groups: viewSubStats.querySelectorAll(".sub-stat-values-in-group")
    }
}

let selects = SubStat.allStats.map(it => new Select(it, false));

function clear(e) { while (e.firstChild != null) { e.removeChild(e.firstChild); } }

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
    stats.map(stat => selects.find(it => it.stat == stat)).forEach((select, index) => {
        view.labels[index].textContent = select.stat.name;
        clear(view.selects[index]);
        select.groups.forEach(it => {
            let op = createElemWithText("option", first(it).formattedValue);
            view.selects[index].appendChild(op);
        });
        view.selects[index].selectedIndex = select.cursor[0];
    });
    for (let index = stats.length; index < MAX_SELECTABLE_COUNT; index++) {
        view.labels[index].textContent = "";
        clear(view.selects[index]);
    }
}

function onSelectChange(index) {
    let select = selects.find(it => it.stat == stats[index]);
    select.cursor[0] = view.selects[index].selectedIndex;
    select.cursor[1] = 0;
    updateSubStatValuesInGroup();
}

view.selects.forEach((it, idx) => it.addEventListener("change", () => onSelectChange(idx)));

function updateSubStatValuesInGroup() {
    stats.map(stat => selects.find(it => it.stat == stat)).forEach((select, index) => {
        clear(view.groups[index]);
        select.groups[select.cursor[0]].forEach((sub, idx) => {
            let label = document.createElement("label");
            label.appendChild(createElemWithText("span", sub.value));
            let radio = document.createElement("input");
            radio.setAttribute("type", "radio");
            radio.setAttribute("name", "stat" + index);
            if (idx == select.cursor[1]) { radio.checked = true; }
            radio.addEventListener("change", () => {
                if (radio.checked) {
                    select.cursor[1] = idx;
                }
                updateScore();
            });
            label.appendChild(radio);
            let graph = createElemWithClass("div", "horizontal-stacked-bar");
            for (let i = 2; i >= 0; i--) {
                repeat(sub.rolls[i], () => {
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
            view.groups[index].appendChild(label);
        });
    });
    for (let index = stats.length; index < MAX_SELECTABLE_COUNT; index++) {
        clear(view.groups[index]);
    }
    updateScore();
}

function repeat(times, func) {
    for (let i = 0; i < times; i++) { func(); }
}

document.getElementById("deduplicate").addEventListener("change", (e) => {
    selects = selects.map(it => it.toggle());
    updateSubStatValuesInGame();
    updateSubStatValuesInGroup();
});


document.getElementById("dark-mode").addEventListener("change", (e) => {
    document.body.classList.toggle("dark");
});

const weight = new Map();
SubStat.allStats.forEach(stat => {
    switch (stat) {
        case Stat.FLAT_HP:
        case Stat.FLAT_ATK:
        case Stat.FLAT_DEF:
            weight.set(stat, 0.5);
            break;
        default:
            weight.set(stat, 1);
            break;
    }
});

function updateScore() {
    let total = 0;
    stats.map(stat => selects.find(it => it.stat == stat)).forEach(select => {
        total += select.current.value / last(SubStat.getInitialValues(select.stat)) * weight.get(select.stat) * 10;
    });
    document.getElementById("total").textContent = Math.round(total * 10) / 10;
}
