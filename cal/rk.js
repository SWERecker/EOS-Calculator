// RK: a & b
const RKaEql = math.parse('0.42748 * ((R^2 * Tc^2.5) / (Pc * 10^6))');
const RKbEql = math.parse('0.08664 * ((R * Tc) / (Pc * 10^6))');
const RKaTex = '0.42748\\frac{R^{2} T_c^{2.5}}{P_c}';
const RKbTex = '0.08664\\frac{R T_c}{P_c}';
const calRKa = RKaEql.compile();
const calRKb = RKbEql.compile();


// RK: VT=>P
const RKEql = math.parse('(R * T)/(V - b) - a / (T^(1/2) * V * (V + b))');
const RKTex = 'P=\\frac{RT}{V-b}-\\frac{a}{T^{\\frac{1}{2}} V (V+b)}';
const calRK = RKEql.compile();


// RK: PT=>V
const RKV0Eql = math.parse('R * T / p');
const RKVIterEql = math.parse('((R * T) / p) + b - (a*(V-b)) / (p * T^(0.5) * V * (V + b))');
const RKZEql = math.parse('(p * V) / (R * T)');
const calRKV0 = RKV0Eql.compile();
const calRKVIter = RKVIterEql.compile();
const calRKZ = RKZEql.compile();


// RK: PV=>T
// const RKT0Eql = math.parse('p * V / R');
//const RKTIterEql = math.parse('(Pr + (a / (sqrt(Tr) * Vr * (Vr + b)))) * (Vr - b)');
const RKTIterEql = math.parse('(Pr+a/(sqrt(Tr)*Vr*(Vr+b)))*(Vr-b)')
const RKTTr = math.parse('T/Tc');
const RKTPr = math.parse('P/Pc');
const RKTVr = math.parse('(V*Pc) / (R*Tc)');
const calRKTIter = RKTIterEql.compile();
const calRKTTr = RKTTr.compile();
const calRKTPr = RKTPr.compile();
const calRKTVr = RKTVr.compile();

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
    $('#solveMethod').hide();

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
    $('#solveMethod').hide();
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
 * ??????RK?????????a, b??????
 */
$('#btnCalRKab').click(function () {
    let tempT = null;
    let tempP = null;
    try {
        tempT = math.evaluate($('#calRKTc').val());
        tempP = math.evaluate($('#calRKPc').val());
    } catch (e) {
        appNotify('danger', 'a???b??????????????????');
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
    $('#calRKa').html("$a=" + RKaTex + "=" + math.parse(math.format(RKa, 4)).toTex() + RKaUnit + "$");
    $('#calRKb').html("$b=" + RKbTex + "=" + math.parse(math.format(RKb, 4)).toTex() + Vunit + "$");
    MathJax.typeset();
});

$('#btnCalRK').click(function () {
    if (RKa === null || RKb === null) {
        appNotify('danger', 'a???b?????????????????????a???b');
        return;
    }
    let valRKT = null;
    let valRKV = null;
    let valRKP = null;
    let resultArea = $('#resultRK');
    // VT => P
    if (rkMode === 'vtp') {
        try {
            valRKT = math.evaluate($('#calRKT').val());
            valRKV = math.evaluate($('#calRKV').val());
        } catch (e) {
            console.error(e);
            appNotify('danger', 'V???T???????????????????????????');
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
            resultArea.html('<div id="resultRKContent"></div>');
            $('#resultRKContent')
                .html(`$${RKTex}=${math.parse(math.format(res, 6)).toTex()}Pa$`);
            MathJax.typeset();
        } else {
            appNotify('danger', 'V???T???????????????????????????');
            return;
        }
    }

    // PT => V
    if (rkMode === 'ptv') {
        try {
            valRKT = math.evaluate($('#calRKT').val());
            valRKP = math.evaluate($('#calRKP').val());
        } catch (e) {
            console.error(e);
            appNotify('danger', 'P???T???????????????????????????');
            return;
        }
        if (typeof valRKP == "number" && typeof valRKT == "number") {
            let PcPa = math.evaluate('Pc * 10^6', {Pc: $('#calRKPc').val()})
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
                // ????????????
                rkCubicSolveV(vars)
                    .then(result => {
                        let V = result['V'];
                        let first = math.format(result['first'], 6);
                        let second = math.format(result['second'], 6);
                        let third = math.format(result['third'], 6);
                        let regular = math.format(result['regular'], 6);

                        let cubicTex = cubicToTex(third, second, first, regular);
                        resultArea.html('<div id="resultRKContent"></div>' +
                            '<div class="uk-list uk-list-disc uk-list-emphasis" id="resultRKSummary"></div>');
                        $('#resultRKContent').html(
                            `$${cubicTex}=0$<br><br>` +
                            `????????????<br>` +
                            `<li>$x_{1}=${result['x1']}$</li>` +
                            `<li>$x_{2}=${result['x2']}$</li>` +
                            `<li>$x_{3}=${result['x3']}$</li>` +
                            `<p>$V=${math.parse(math.format(V, 6)).toTex()} ${Vunit}$</p>`
                        );
                        MathJax.typeset();
                    })
            }

            if (rkSolveMethod === 'iter') {
                // ?????????
                let iterTimes = parseInt($('#iterTimesRK').val());
                !isNaN(iterTimes) ? iterTimes = iterTimes : iterTimes = 0;

                iterSolveV(iterTimes, vars)
                    .then(iterResult => {
                        let rkIterMap = iterResult['iterMap'];
                        let iterTime = iterResult['iterTime'];
                        let deltaZ = iterResult['deltaZ']

                        let displayTableHeading = [`$V$`, "$Z$"];
                        let displayTableContent = [];

                        for (let key in rkIterMap) {
                            displayTableContent.push([
                                `$V_{${key}}=${math.parse(math.format(rkIterMap[key]["V"], 5)).toTex()}${Vunit}$`,
                                `$Z_{${key}}=${math.parse(math.format(rkIterMap[key]["Z"], 8)).toTex()}$`
                            ]);
                        }
                        let tableHtml = createResultTable(displayTableHeading, displayTableContent);
                        resultArea.html('<div id="resultRKContent"></div>' +
                            '<div class="uk-list uk-list-disc uk-list-emphasis" id="resultRKSummary"></div>');
                        $('#resultRKContent').html(tableHtml);
                        $('#resultRKSummary').html(
                            `<li>???????????????$${iterTime}$</li>` +
                            `<li>??????$|Z_{${iterTime}}-Z_{${(--iterTime)}}| = ${deltaZ.toTex()}$</li>` +
                            `<li>$V=${math.parse(math.format(rkIterMap[(++iterTime)]["V"], 6)).toTex()} ${Vunit}$</li>`);
                        MathJax.typeset();
                        appNotify('success', '?????????????????????', 'check');
                    });
            }
        } else {
            appNotify('danger', 'P???T???????????????????????????');
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
            appNotify('danger', 'V???P???????????????????????????');
            return;
        }
        if (typeof valRKP == "number" && typeof valRKV == "number") {
            let PcPa = math.evaluate('Pc * 10^6', {Pc: $('#calRKPc').val()})
            let vars = {
                R: constR,
                P: valRKP,
                V: valRKV,
                a: 0.4274802335403414,
                b: 0.08664034996495773,
                Tc: math.evaluate($('#calRKTc').val()),
                Pc: PcPa,
                Tr: 1
            }
            iterSolveT(0, vars).then(r =>{
                console.log('PVT OK.');
            })

            MathJax.typeset();
        } else {
            appNotify('danger', 'V???P???????????????????????????');
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

async function rkCubicSolveV(vars) {
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

    return cubicSolve(1, secCof, firstCof, regular)
        .then(cubicResult => {
            console.log(cubicResult);
            console.log(vars);
            let x1Re = cubicResult['x1Re'];
            let x1Im = cubicResult['x1Im'];

            let x2Re = cubicResult['x2Re'];
            let x2Im = cubicResult['x2Im'];

            let x3Re = cubicResult['x3Re'];
            let x3Im = cubicResult['x3Im'];

            solveResult['x1'] = math.complex(x1Re, x1Im);
            solveResult['x2'] = math.complex(x2Re, x2Im);
            solveResult['x3'] = math.complex(x3Re, x3Im);

            if (math.larger(vars.T, vars.Tc)) {
                console.log("T > Tc??????????????????????????????????????????????????????");
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
                    console.log("p = Pc??????????????????V=Vc");
                    return solveResult;
                } else {
                    console.log("p != Pc??????????????????????????????????????????????????????");
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
                console.log("T < Tc??????????????????/????????????");
                console.log("V_SL = " + math.min(x1Re, x2Re, x3Re).toString());
                console.log("V_SV = " + math.max(x1Re, x2Re, x3Re).toString());
                solveResult['V'] = math.max(x1Re, x2Re, x3Re);
                return solveResult;
            }
        })
}

async function iterSolveV(iterTimes, vars) {
    let Zn_1 = 999;
    let Zn = 1;
    let deltaZ = 0;

    let iterTime = 0;   // ?????????iterTime???

    if (iterTimes < 0) {
        appNotify('danger', '??????????????????????????????');
        return;
    }
    // ????????????
    vars.V = calRKV0.evaluate(vars);
    // ??????????????????
    let iterMap = {
        "0": {
            "V": vars.V,
            "Z": 1
        }
    }

    while (true) {
        vars.V = iterMap[iterTime]["V"];
        Zn = iterMap[iterTime]["Z"];
        console.debug(`Iter times = ${iterTime} Zn+1 = ${Zn_1} | Zn = ${Zn}`);
        // ????????????+1
        iterTime++;
        // ???????????????V
        let Vnext = calRKVIter.evaluate(vars);
        // ?????????????????????V
        iterMap[iterTime] = {};
        iterMap[iterTime]["V"] = Vnext;

        // ????????Z
        // Z1 = pV1/RT
        // Z0 = pV0/RT
        vars.V = Vnext;
        Zn_1 = calRKZ.evaluate(vars);
        iterMap[iterTime]["Z"] = Zn_1;

        // ???????????????????????Z
        deltaZ = math.abs(Zn_1 - Zn);

        // ????????????
        if (iterTime >= 100) {
            // ?????????????????????????????????
            appNotify('danger', '???????????????????????????????????????');
            break;
        }

        if (iterTimes === 0) {
            if (math.smaller(math.abs(Zn_1 - Zn), 0.00001)) {
                break;
            }
        } else {
            if (math.equal(math.abs(math.evaluate('Zn1 - Zn', {
                Zn1: Zn_1,
                Zn: Zn
            })), 0) && iterTimes !== 0) {
                appNotify('danger', `$\\Delta Z$????????????${iterTime}????????????0`);
                MathJax.typeset();
                break;
            }
            if (iterTime === iterTimes) {
                break;
            }
        }
    }
    return {
        "iterTime": iterTime,
        "deltaZ": math.parse(math.format(deltaZ, 6)),
        "iterMap": iterMap
    };
}

async function iterSolveT(iterTimes, vars) {
    // Tr ?????????1
    vars.Pr = calRKTPr.evaluate(vars);
    vars.Vr = calRKTVr.evaluate(vars);
    console.log(vars);
    let iterTime = 0;
    let iterMap = {
        "0": {
            Tr: 1
        }
    }
    while(true) {
        vars.Tr = iterMap[iterTime]["Tr"];
        let TrNext = calRKTIter.evaluate(vars);
        iterTime++;
        iterMap[iterTime] = {};
        iterMap[iterTime]["Tr"] = TrNext;

        if (math.smaller(math.abs(math.evaluate('TrNext - Tr', {Tr: vars.Tr, TrNext: TrNext})), 0.00001)) {
            break;
        }

        if (iterTime > 100) {
            break;
        }
    }
    console.log(vars);
    console.log(iterMap);
}