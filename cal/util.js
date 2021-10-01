const constR = math.evaluate('8.314');
let Vunit = '\\mathrm{m}^3\\cdot\\mathrm{mol}^{-1}';

MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global',
        scale: 1.1
    }
};

$('#unitConvertAtm').change(function () {
    let valAtm = 0;
    let valPa = 0;
    try {
        valAtm = math.evaluate($('#unitConvertAtm').val())
    } catch (e) {
        return;
    }
    typeof valAtm != "undefined" ? valAtm = valAtm : valAtm = 0;
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
    {"name": "丙烷", "Tc": 369.8, "Pc": 4.246}
]

$().ready(function() {
    predef_data.forEach(function (obj, index) {
        $("#rk-predefined").appendOption(index + " - " + obj.name);
    });
})