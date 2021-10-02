// RK: VT=>P
const RKaEql = math.parse('0.42748 * ((R^2 * Tc^2.5) / (Pc * 10^6))');
const RKbEql = math.parse('0.08664 * ((R * Tc) / (Pc * 10^6))');
const RKEql = math.parse('(R * T)/(V - b) - a / (T^(1/2) * V * (V + b))');

// RK: PT=>V
const RKV0Eql = math.parse('R * T / p');
const RKVIterEql = math.parse('((R * T) / p) + b - (a*(V-b)) / (p * T^(0.5) * V * (V + b))');
const RKZEql = math.parse('(p * V) / (R * T)');

// RK: PV=>T


const calRKa = RKaEql.compile();
const calRKb = RKbEql.compile();
const calRK = RKEql.compile();
const calRKV0 = RKV0Eql.compile();
const calRKIter = RKVIterEql.compile();
const calRKZ = RKZEql.compile();

const RKaUnit = 'Pa\\cdot\\mathrm{m}^6\\cdot\\mathrm{K}^{0.5}\\mathrm{mol}^{-2}'

let RKa = null;
let RKb = null;

let rkMode = 'vtp';

$('#rdVtP').click(function () {
    rkMode = 'vtp';
    $('#input-rkv').show();
    $('#input-rkt').show();
    $('#input-rkp').hide();
    $('#input-rkIter').hide();
});

$('#rdPtV').click(function () {
    rkMode = 'ptv';
    $('#input-rkp').show();
    $('#input-rkt').show();
    $('#input-rkv').hide();
    $('#input-rkIter').show();
});

$('#rdPvT').click(function () {
    rkMode = 'pvt';
    $('#input-rkp').show();
    $('#input-rkv').show();
    $('#input-rkt').hide();
    $('#input-rkIter').show();
});

/**
 * 计算RK方程中a, b的值
 */
$('#btnCalRKab').click(function () {
    let tempT = null;
    let tempP = null;
    try {
        tempT = math.evaluate($('#calRKTc').val());
        tempP = math.evaluate($('#calRKPc').val());
    } catch (e) {
        appNotify('danger', 'a或b值输入有误！');
        return;
    }
    let vars = {
        Tc: tempT,
        Pc: tempP,
        R: constR,
    }
    // console.log(vars);
    RKa = calRKa.evaluate(vars);
    RKb = calRKb.evaluate(vars);
    $('#calRKa').html("$a=" + RKaEql.toTex() + "=" + math.parse(math.format(RKa, 4)).toTex() + RKaUnit + "$");
    $('#calRKb').html("$b=" + RKbEql.toTex() + "=" + math.parse(math.format(RKb, 4)).toTex() + Vunit + "$");
    MathJax.typeset();
});

$('#btnCalRK').click(function () {
    if (RKa === null || RKb === null) {
        appNotify('danger', 'a或b为空！请先计算a和b');
        return;
    }
    let valRKT = null;
    let valRKV = null;
    let valRKP = null;
    let resultArea = $('#resultRK');

    // VT => P
    if (rkMode === 'vtp') {
        resultArea.html('<div id="resultRKContent"></div>');
        try {
            valRKT = math.evaluate($('#calRKT').val());
            valRKV = math.evaluate($('#calRKV').val());
        } catch (e) {
            console.error(e);
            appNotify('danger', 'V或T数据有误，请检查！');
        }
        if (typeof valRKT == "number" && typeof valRKV == "number") {
            let vars = {
                a: RKa,
                b: RKb,
                V: valRKV,
                T: valRKT,
                R: constR
            }
            const res = calRK.evaluate(vars);
            $('#resultRKContent')
                .html(`$P=${RKEql.toTex()}=${math.parse(math.format(res, 4)).toTex()}Pa$`);
            MathJax.typeset();
        } else {
            appNotify('danger', 'V或T数据有误，请检查！');
            return;
        }
    }

    // PT => V
    if (rkMode === 'ptv') {
        resultArea.html('<div id="resultRKContent"></div>' +
            '<div class="uk-list uk-list-disc uk-list-emphasis" id="resultRKSummary"></div>');
        try {
            valRKT = math.evaluate($('#calRKT').val());
            valRKP = math.evaluate($('#calRKP').val());
        } catch (e) {
            console.error(e);
            appNotify('danger', 'P或T数据有误，请检查！');
            return;
        }
        if (typeof valRKP == "number" && typeof valRKT == "number") {
            let iterTimes = parseInt($('#iterTimesRK').val());
            !isNaN(iterTimes) ? iterTimes = iterTimes : iterTimes = 0;
            let Zn_1 = 999;
            let Zn = 1;
            let finalDeltaZ = 0;

            let vars = {
                a: RKa,
                b: RKb,
                T: valRKT,
                p: valRKP,
                R: constR
            }
            vars.V = calRKV0.evaluate(vars);
            let rkIterMap = {
                "0": {
                    "V": vars.V,
                    "Z": 1
                }
            }

            let iterTime = 0;
            if (iterTimes === 0) {
                while (math.abs(Zn_1 - Zn) > 0.0001) {
                    // 代入上个迭代的V，储存Zn
                    vars.V = rkIterMap[iterTime]["V"];
                    Zn = rkIterMap[iterTime]["Z"];
                    // console.log(`Iter times = ${iterTime} Zn+1 = ${Zn_1} | Zn = ${Zn}`);
                    iterTime++;
                    // 计算下一个V
                    let Vnext = calRKIter.evaluate(vars);
                    // 储存每次迭代的V
                    rkIterMap[iterTime] = {};
                    rkIterMap[iterTime]["V"] = Vnext;

                    // 计算|Zn+1 - Zn|
                    // Z1 = pV1/RT
                    // Z0 = pV0/RT
                    vars.V = Vnext;
                    Zn_1 = calRKZ.evaluate(vars);
                    rkIterMap[iterTime]["Z"] = Zn_1;
                    if (iterTime > 100) {
                        appNotify('danger', '迭代次数过多，请检查数据！');
                        break;
                    }
                }
                // 记录迭代结束的|Zn+1 - Zn|
                finalDeltaZ = math.abs(Zn_1 - Zn);
            } else if (iterTimes > 0) {
                if (iterTimes > 100) {
                    appNotify('danger', '迭代次数过多，可能导致卡死！');
                    return;
                }
                while (iterTimes > 0) {
                    // 代入上个迭代的V，储存Zn
                    vars.V = rkIterMap[iterTime]["V"];
                    Zn = rkIterMap[iterTime]["Z"];
                    // console.log(`Iter times = ${iterTime} Zn+1 = ${Zn_1} | Zn = ${Zn}`);
                    iterTime++;
                    // 计算下一个V
                    let Vnext = calRKIter.evaluate(vars);
                    // 储存每次迭代的V
                    rkIterMap[iterTime] = {};
                    rkIterMap[iterTime]["V"] = Vnext;

                    // 计算|Zn+1 - Zn|
                    // Z1 = pV1/RT
                    // Z0 = pV0/RT
                    vars.V = Vnext;
                    Zn_1 = calRKZ.evaluate(vars);
                    rkIterMap[iterTime]["Z"] = Zn_1;
                    iterTimes--;
                    // console.log(iterTimes);
                    let calZScope = {
                        Zn1: Zn_1,
                        Zn: Zn
                    }
                    if (math.abs(math.evaluate('Zn1 - Zn', calZScope)) === 0 && iterTimes !== 0) {
                        appNotify('danger', `$|Z_{n+1}-Z_n|已经在第${iterTime}次迭代=0$`);
                        MathJax.typeset();
                        break;
                    }
                }
                finalDeltaZ = math.abs(Zn_1 - Zn);
            } else {
                appNotify('danger', '迭代次数不能为负数！');
                return;
            }
            let displayTableHeading = [`$V$`, "$Z$"];
            let displayTableContent = [];

            for (let key in rkIterMap) {
                displayTableContent.push([`$V_{${key}}=${math.parse(math.format(rkIterMap[key]["V"], 5)).toTex()}${Vunit}$`, `$Z_{${key}}=${math.format(rkIterMap[key]["Z"], 8)}$`]);
            }
            let tableHtml = createResultTable(displayTableHeading, displayTableContent);

            $('#resultRKContent').html(tableHtml);
            $('#resultRKSummary').html(`<li>迭代次数：$${iterTime}$</li>
                             <li>最终$|Z_{${iterTime}}- Z_{${(--iterTime)}}|=${math.parse(math.format(finalDeltaZ, 6)).toTex()}$</li>
                             <li>$V=${math.parse(math.format(rkIterMap[(++iterTime)]["V"], 4)).toTex()} ${Vunit}$</li>`);
            MathJax.typeset();
            appNotify('success', '迭代计算完成！', 'check');
        } else {
            appNotify('danger', 'P或T数据有误，请检查！');
            return;
        }
    }
    if (rkMode === 'pvt') {
        // PV => T
        try {
            valRKV = math.evaluate($('#calRKV').val());
            valRKP = math.evaluate($('#calRKP').val());
        } catch (e) {
            console.error(e);
            appNotify('danger', 'V或P数据有误，请检查！');
            return;
        }
        if (typeof valRKP == "number" && typeof valRKV == "number") {
            let vars = {
                R: constR,
                P: valRKV,
                V: valRKV,
                a: RKa,
                b: RKb
            }
            let f = math.parse('(R * T)/(V-b) - a / (T^(1/2) * V * (V + b))');
            let transformed = f.transfromVars(vars, "T");
            console.log(transformed.toString());
            resultArea.html('$' + math.parse(transformed.toString()).toTex() + '$');
            MathJax.typeset();
        } else {
            appNotify('danger', 'V或P数据有误，请检查！');
        }
    }
});

$("#rk-predefined").change(function() {
    let selected = this.selectedIndex - 1;
    let inputTc = $('#calRKTc');
    let inputPc = $('#calRKPc');
    if (selected < 0) {
        inputTc.val('');
        inputPc.val('');
        RKa = null;
        RKb = null;
        $('#calRKa').html('$a=$');
        $('#calRKb').html('$b=$');
        MathJax.typeset();
        return;
    }
    inputTc.val(predef_data[selected].Tc);
    inputPc.val(predef_data[selected].Pc);
    $('#btnCalRKab').click();
});