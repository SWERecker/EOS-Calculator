function cubicSolve(a, b, c, d)
{
    let result = {};
    if (a === 0)
    {
        alert("The coefficient of the cube of x is 0. Please use the utility for a SECOND degree quadratic. No further action taken.");
        return result;
    } //End if a == 0

    if (d === 0)
    {
        alert("One root is 0. Now divide through by x and use the utility for a SECOND degree quadratic to solve the resulting equation for the other two roots. No further action taken.");
        return result;
    } //End if d == 0
    b = math.divide(b, a);
    c = math.divide(c, a);
    d = math.divide(d, a);
    let vars = {
        a: a,
        b: b,
        c: c,
        d: d
    }
    // let disc, q, r, dum1, s, t, term1, r13;
    vars.q = math.evaluate('(3*c - (b*b))/9', vars);
    vars.r = math.evaluate('(-(27*d) + b*(9*c - 2*(b^2)))/54', vars);
    vars.disc = math.evaluate('q^3 + r^2', vars);
    result['x1Im'] = 0; //The first root is always real.
    vars.term1 = math.evaluate('b/3', vars);
    if (math.isPositive(vars.disc)) { // one root real, two are complex
        vars.s = math.evaluate('r + sqrt(disc)', vars);
        vars.s = math.isNegative(vars.s) ? math.evaluate('-pow(-s, (1/3))', vars) : math.evaluate('pow(s, (1/3))', vars);
        vars.t = math.evaluate('r - sqrt(disc)', vars);
        vars.t = math.isNegative(vars.t) ? math.evaluate('-pow(-t, (1/3))', vars) : math.evaluate('pow(t, (1/3))', vars);
        result['x1Re'] = math.evaluate('-term1 + s + t', vars);
        vars.term1 += math.evaluate('(s + t)/2', vars);
        result['x3Re'] = result['x2Re'] = -vars.term1;
        vars.term1 = math.evaluate('sqrt(3.0)*(-t + s)/2', vars);
        result['x2Im'] = vars.term1;
        result['x3Im'] = -vars.term1;
        console.log(vars);
        return result;
    }
    // End if (disc > 0)
    // The remaining options are all real
    result['x3Im'] = result['x2Im'] = 0;
    if (math.isZero(vars.disc)){ // All roots real, at least two are equal.
        vars.r13 = math.isNegative(vars.r) ? math.evaluate('-pow(-r, (1/3))', vars) : math.evaluate('pow(r,(1/3))', vars);
        result['x1Re'] = math.evaluate('-term1 + 2 * r13', vars);
        result['x3Re'] = result['x2Re'] = math.evaluate('-(r13 + term1)', vars);
        console.log(vars);
        return result;
    } // End if (disc == 0)
    // Only option left is that all roots are real and unequal (to get here, q < 0)
    vars.q = -vars.q;
    vars.dum1 = math.evaluate('q^3', vars);
    vars.dum1 = math.evaluate('acos(r / sqrt(dum1))', vars);
    vars.r13 = math.evaluate('2 * sqrt(q)', vars);
    result['x1Re'] = math.evaluate('-term1 + r13 * cos(dum1 / 3)', vars);
    result['x2Re'] = math.evaluate('-term1 + r13 * cos((dum1 + 2*PI)/3)', vars);
    result['x3Re'] = math.evaluate('-term1 + r13 * cos((dum1 + 4*PI)/3)', vars);
    console.log(vars);
    return result;
}

console.log(cubicSolve(2, 4, 5, 10))