const SRKEql = math.parse('(R*T)/(V-b) - aT/(V*(V+b))');
const SRKaT = math.parse('(1 + (0.48+1.574*w - 0.176*w^2) * (1 - Tr^0.5)) ^ 2');
const SRKb = math.parse('(0.08664 * R * Tc) / Pc');
const calSRK = SRKEql.compile();
const calSRKaT = SRKaT.compile();
const calSRKb = SRKb.compile();