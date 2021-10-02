const vdWaEql = math.parse('(27 * R^2 * Tc^2) / (64 * Pc * 10^6)');
const vdWbEql = math.parse('(R * Tc) / (8 * Pc * 10^6)');
const vdWEql = math.parse('(R * T)/(V - b) - (a / V^2)');

const calvdWa = vdWaEql.compile();
const calvdWb = vdWbEql.compile();
const calvdW = vdWEql.compile();

let vdWa = null;
let vdWb = null;
let vdWMode = "vtp";

const vdWaUnit = 'Pa\\cdot\\mathrm{m}^6\\cdot\\mathrm{mol}^{-2}'

$('#vdWVtP').click(function () {
    vdWMode = 'vtp';
    $('#input-vdWv').show();
    $('#input-vdWt').show();
    $('#input-vdWp').hide();
    $('#input-vdwIter').hide();
});

$('#vdWPtV').click(function () {
    vdWMode = 'ptv';
    $('#input-vdWp').show();
    $('#input-vdWt').show();
    $('#input-vdWv').hide();
    $('#input-vdwIter').show();
});

$('#vdWPvT').click(function () {
    vdWMode = 'pvt';
    $('#input-vdWp').show();
    $('#input-vdWv').show();
    $('#input-vdWt').hide();
    $('#input-vdwIter').show();
});

/**
 * 计算范德华方程中a, b的值
 */
$('#btnCalVdWab').click(function () {
    let tempT = null;
    let tempP = null;
    try {
        tempT = math.evaluate($('#calVdWTc').val());
        tempP = math.evaluate($('#calVdWPc').val());
    } catch (e) {
        appNotify('danger', 'a或b值输入有误！');
        return;
    }
    let vars = {
        Tc: tempT,
        Pc: tempP,
        R: constR,
    }
    console.log(vars);
    vdWa = calvdWa.evaluate(vars);
    vdWb = calvdWb.evaluate(vars);
    $('#calVdWa').html("$a=" + vdWaEql.toTex() + "=" + math.parse(math.format(vdWa, 4)).toTex() + vdWaUnit + "$");
    $('#calVdWb').html("$b=" + vdWbEql.toTex() + "=" + math.parse(math.format(vdWb, 4)).toTex() + Vunit + "$");
    MathJax.typeset();
});


$("#vdw-predefined").change(function() {
    let selected = this.selectedIndex - 1;
    let inputTc = $('#calVdWTc');
    let inputPc = $('#calVdWPc');
    if (selected < 0) {
        inputTc.val('');
        inputPc.val('');
        vdWa = null;
        vdWb = null;
        $('#calVdWa').html('$a=$');
        $('#calVdWb').html('$b=$');
        MathJax.typeset();
        return;
    }
    inputTc.val(predef_data[selected].Tc);
    inputPc.val(predef_data[selected].Pc);
    $('#btnCalVdWab').click();
});