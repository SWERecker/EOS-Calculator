const PREql = math.parse('(R*T)/(V-b) - aT/(V*(V+b) + b*(V-b))');
const PRaT = math.parse('(1 + (0.37464 + 1.54226*w - 0.26992*w^2) * (1 - Tr^0.5)) ^ 2');
const PRb = math.parse('(0.07780 * R * Tc) / Pc');
const calPR = PREql.compile();
const calPRaT = PRaT.compile();