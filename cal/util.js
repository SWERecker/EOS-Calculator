const constR = math.evaluate('8.3144');
let Vunit = '\\mathrm{m}^3\\cdot\\mathrm{mol}^{-1}';
let RKaUnit = 'Pa\\cdot\\mathrm{m}^6\\cdot\\mathrm{K}^{0.5}\\mathrm{mol}^{-2}'

MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global',
        scale: 1.1
    }
};

$('#unitConvertAtm').change(function(){
    let valAtm = 0;
    let valPa = 0;
    try {
        valAtm = math.evaluate($('#unitConvertAtm').val())
    }catch (e) {
        return;
    }
    typeof valAtm != "undefined" ? valAtm = valAtm : valAtm = 0;
    let calAtmToPa =  math.parse('0.101325 * atm * 10^6').compile();
    let vars = {
        atm: valAtm
    }
    valPa = calAtmToPa.evaluate(vars);
    $('#convertResultsUl').append('<li>$' + valAtm + 'atm=' + math.parse(math.format(valPa, 6)).toTex() + 'Pa$</li>');
    console.log(valAtm);
    MathJax.typeset();
});

function appNotify(type, content, iconType='warning') {
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