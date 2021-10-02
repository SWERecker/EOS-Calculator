const constR = math.evaluate('8.314');
let Vunit = '\\mathrm{m}^3\\cdot\\mathrm{mol}^{-1}';
let darkMode = false;
let cookieExpireDate = (new Date("2077/1/14 05:14:19")).toGMTString();
MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global',
        scale: 1.1
    }
};
$('#dark').click(function () {
    if (!darkMode) {
        darkMode = true
        $('body').attr('class', 'uk-background-secondary uk-light')
        $('.uk-card').attr('class', 'uk-card uk-card-secondary uk-card-body');
        document.cookie = `theme=dark; expires=${cookieExpireDate}`
        $('#dark-icon').attr("src", "./resource/sun.svg")
        $('#dark').attr("class", "switch-theme-btn switch-theme-btn-size switch-theme-dark")
    } else {
        darkMode = false
        $('body').attr('class', 'uk-background-default')
        $('.uk-card').attr('class', 'uk-card uk-card-default uk-card-body');
        document.cookie = `theme=light; expires=${cookieExpireDate}`
        $('#dark-icon').attr("src", "./resource/moon.svg")
        $('#dark').attr("class", "switch-theme-btn switch-theme-btn-size switch-theme")
    }
})

$('#unitConvertAtm').change(function () {
    let valAtm = 0;
    let valPa = 0;
    try {
        valAtm = math.evaluate($('#unitConvertAtm').val())
    } catch (e) {
        appNotify('danger', '数据输入有误！');
        return;
    }
    typeof valAtm != "undefined" ? valAtm = valAtm : valAtm = 0;
    if (valAtm === 0) {
        return;
    }
    let calAtmToPa = math.parse('0.101325 * atm * 10^6').compile();
    let vars = {
        atm: valAtm
    }
    valPa = calAtmToPa.evaluate(vars);
    let valMPa = valPa / 1000000;
    $('#convertResultsUl').append(`<li>$${valAtm}atm=${math.parse(math.format(valPa, 6)).toTex()}Pa=${math.parse(math.format(valMPa, 6)).toTex()}MPa$</li>`);
    MathJax.typeset();
});

function appNotify(type, content, iconType = 'warning') {
    UIkit.notification({
        message: `<span uk-icon='icon: ${iconType}'></span> ${content}`,
        status: type,
        timeout: 3000
    });
}

function createResultTable(headings, data) {
    let headingHtml = "", contentHtml = ""

    for (let heading of headings) {
        headingHtml += `<th>${heading}</th>`;
    }
    for (let content of data) {
        contentHtml += "<tr>";
        for (let tableData of content) {
            contentHtml += `<td>${tableData}</td>`
        }
        contentHtml += "</tr>";
    }
    return `<table class="uk-table uk-table-striped"><thead><tr>${headingHtml}</tr></thead><tbody>${contentHtml}</tbody></table>`
}

math.OperatorNode.prototype.transfromVars = function (vars, exc) {
    return this.transform(function (node, path, parent) {
        if (node.isSymbolNode && node.name !== exc) {
            return new math.ConstantNode(vars[node.name]);
        } else {
            return node
        }
    })
}

$.fn.appendOption = function (option) {
    this.append('<option>' + option + '</option>')
}

predef_data = [
    {"name": "甲烷", "Tc": 190.6, "Pc": 4.600},
    {"name": "乙烷", "Tc": 305.4, "Pc": 4.884},
    {"name": "丙烷", "Tc": 369.8, "Pc": 4.246},
    {"name": "正丁烷", "Tc": 425.2, "Pc": 3.800},
    {"name": "异丁烷", "Tc": 408.1, "Pc": 3.648},
    {"name": "正戊烷", "Tc": 469.6, "Pc": 3.374},
    {"name": "异戊烷", "Tc": 460.4, "Pc": 3.384},
    {"name": "新戊烷", "Tc": 433.8, "Pc": 3.202},
    {"name": "正己烷", "Tc": 507.4, "Pc": 2.969},
    {"name": "正庚烷", "Tc": 540.2, "Pc": 2.736},
    {"name": "正辛烷", "Tc": 568.8, "Pc": 2.482}
]

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

$().ready(function () {
    console.log(getCookie("theme"))
    if (getCookie("theme") ==="dark") {
        $('#dark').click();
    }
        predef_data.forEach(function (obj, index) {
            $("#rk-predefined").appendOption(index + " - " + obj.name);
            $("#vdw-predefined").appendOption(index + " - " + obj.name);
        });
})