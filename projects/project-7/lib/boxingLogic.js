export function clamp(v, a, b){
  return Math.max(a, Math.min(b, v));
}

export function canHit(attackerPos, targetPos, range=2.0){
  return attackerPos.distanceTo(targetPos) < range;
}

export function calcPunchDamage(side, speed){
  // speed approx: 0.0 - 1.0
  const base = side === "right" ? 8 : 7;
  const bonus = Math.round(clamp(speed, 0, 1) * 6); // max +6
  return base + bonus;
}

export function isKO(hp){
  return hp <= 0;
}
