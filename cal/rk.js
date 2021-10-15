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
let rkSolveMethod = 'iter';

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
    $('#solveMethod').show();
});

$('#rdPvT').click(function () {
    rkMode = 'pvt';
    $('#input-rkp').show();
    $('#input-rkv').show();
    $('#input-rkt').hide();
    $('#input-rkIter').show();
});

$('#ptvIter').click(function () {
    rkSolveMethod = 'iter';
    $('#input-rkIter').show();
});

$('#ptvCubic').click(function () {
    rkSolveMethod = 'cubic';
    $('#input-rkIter').hide();
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
            let PcPa = math.evaluate('P * 10^6', {P: $('#calRKPc').val()})
            let vars = {
                a: RKa,
                b: RKb,
                T: valRKT,
                p: valRKP,
                R: constR,
                Tc: math.evaluate($('#calRKTc').val()),
                Pc: PcPa
            }
            if (rkSolveMethod === 'cubic') {
                // 解方程法
                let result = rkCubicSolveV(vars);
                let V = result['V'];
                let cubicEquation;
                let first = math.format(result['first'], 6);
                let second = math.format(result['second'], 6);
                let third = math.format(result['third'], 6);
                let regular = math.format(result['regular'], 6);
                if (math.equal(third, 1)) {
                    cubicEquation = 'V^3';
                } else {
                    cubicEquation = `${third}V^3`;
                }

                if (math.larger(second, 0)) {
                    if (math.equal(second, 1)) {
                        cubicEquation += `+V^2`;
                    }
                    cubicEquation += `+${second}V^2`;
                } else {
                    cubicEquation += `${second}V^2`;
                }

                if (math.larger(first, 0)) {
                    if (math.equal(first, 1)) {
                        cubicEquation += `+V`;
                    }
                    cubicEquation += `+${first}V`;
                } else {
                    if (math.equal(first, -1)) {
                        cubicEquation += `-V`;
                    }
                    cubicEquation += `${first}V`;
                }

                if (math.larger(regular, 0)) {
                    cubicEquation += `+${regular}`;
                } else {
                    cubicEquation += regular;
                }

                cubicEquation = cubicEquation.replace('e', '^')
                console.log(cubicEquation);
                let cubicTex = math.parse(cubicEquation).toTex();
                $('#resultRKContent').html(`$${cubicTex}=0$<br><br>解之得：$V=${math.parse(math.format(V, 6)).toTex()} ${Vunit}$`)
                MathJax.typeset();
            }
            if (rkSolveMethod === 'iter') {
                // 迭代法
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
                    // 记录迭代结束的|Zn+1 - Zn|
                    finalDeltaZ = math.abs(Zn_1 - Zn);
                } else {
                    appNotify('danger', '迭代次数不能为负数！');
                    return;
                }
                let displayTableHeading = [`$V$`, "$Z$"];
                let displayTableContent = [];

                for (let key in rkIterMap) {
                    displayTableContent.push([
                        `$V_{${key}}=${math.parse(math.format(rkIterMap[key]["V"], 5)).toTex()}${Vunit}$`,
                        `$Z_{${key}}=${math.parse(math.format(rkIterMap[key]["Z"], 8)).toTex()}$`
                    ]);
                }
                let tableHtml = createResultTable(displayTableHeading, displayTableContent);

                $('#resultRKContent').html(tableHtml);
                $('#resultRKSummary').html(`<li>迭代次数：$${iterTime}$</li>
                             <li>最终$|Z_{${iterTime}}- Z_{${(--iterTime)}}|=${math.parse(math.format(finalDeltaZ, 6)).toTex()}$</li>
                             <li>$V=${math.parse(math.format(rkIterMap[(++iterTime)]["V"], 6)).toTex()} ${Vunit}$</li>`);
                MathJax.typeset();
                appNotify('success', '迭代计算完成！', 'check');
            }
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
                p: valRKV,
                V: valRKV,
                a: RKa,
                b: RKb
            }
            // let f = math.simplify('V^3 - ((R*T)/p)*V^2 + (a/T^(0.5) - b*R*T - p*b^2)*V - (a*b)/(p*T^(1/2))', vars, {exactFractions: true});

            // let transformed = f.transfromVars(vars, "x");
            // console.log(f.toString());
            // resultArea.html('$' + math.parse(math.rationalize(math.parse(transformed.toString()))).toTex() + '$');
            MathJax.typeset();
        } else {
            appNotify('danger', 'V或P数据有误，请检查！');
        }
    }
});

$("#rk-predefined").change(function () {
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

function rkCubicSolveV(vars) {
    let solveResult = {}
    // console.log(vars)
    let secCofEql = math.parse('-(R*T)/p');
    let secCof = secCofEql.compile().evaluate(vars);
    // console.log(sec.toString());

    let firstCofEql = math.parse('(1/p)*(a/(T^0.5) - b*R*T - p*(b^2))');
    let firstCof = firstCofEql.compile().evaluate(vars);
    // console.log(firstCof.toString());

    let regularEql = math.parse('-a*b/(p*(T^0.5))');
    let regular = regularEql.compile().evaluate(vars);
    // console.log(regular.toString());

    solveResult['third'] = 1;
    solveResult['second'] = secCof;
    solveResult['first'] = firstCof;
    solveResult['regular'] = regular;
    solveResult['V'] = -1;

    let cubicResult = cubicSolve(1, secCof, firstCof, regular);
    console.log(cubicResult);
    console.log(vars);
    let x1Re = cubicResult['x1Re'];
    let x1Im = cubicResult['x1Im'];

    let x2Re = cubicResult['x2Re'];
    let x2Im = cubicResult['x2Im'];

    let x3Re = cubicResult['x3Re'];
    let x3Im = cubicResult['x3Im'];

    // let x1 = math.complex(x1Re, x1Im);
    // let x2 = math.complex(x2Re, x2Im);
    // let x3 = math.complex(x3Re, x3Im);

    if (math.larger(vars.T, vars.Tc)) {
        console.log("T > Tc，一个实根，两个虚根，实根为摩尔体积");
        if (math.equal(x1Im, 0)) {
            solveResult['V'] = x1Re;
            return solveResult;
        }
        if (math.equal(x2Im, 0)) {
            solveResult['V'] = x2Re;
            return solveResult;
        }
        if (math.equal(x3Im, 0)) {
            solveResult['V'] = x3Re;
            return solveResult;
        }
    } else if (math.equal(vars.T, vars.Tc)) {
        console.log("T = Tc");
        if (math.equal(vars.p, vars.Pc)) {
            console.log("p = Pc，三重实根，V=Vc");
            return solveResult;
        } else {
            console.log("p != Pc，一个实根，两个虚根，实根为摩尔体积");
            if (math.equal(x1Im, 0)) {
                solveResult['V'] = x1Re;
                return solveResult;
            }
            if (math.equal(x2Im, 0)) {
                solveResult['V'] = x2Re;
                return solveResult;
            }
            if (math.equal(x3Im, 0)) {
                solveResult['V'] = x3Re;
                return solveResult;
            }
        }
    } else {
        console.log("T < Tc，可能有一个/三个实根");
        console.log("V_SL = " + math.min(x1Re, x2Re, x3Re).toString());
        console.log("V_SV = " + math.max(x1Re, x2Re, x3Re).toString());
        solveResult['V'] = math.max(x1Re, x2Re, x3Re);
        return solveResult;
    }

}