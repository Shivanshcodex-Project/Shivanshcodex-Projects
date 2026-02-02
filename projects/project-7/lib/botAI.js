import { canHit } from "./boxingLogic.js";

export function createBotAI(){
  return {
    cooldown: 0,
    mode: "medium", // easy | medium | hard
    lastAction: "idle"
  };
}

export function botUpdate({ dt, bot, player, handState, aiState, onBotPunch }){
  if(!bot || !player) return;

  // move small wave
  bot.position.x = 0.8 + Math.sin(performance.now() / 700) * 0.12;

  aiState.cooldown = Math.max(0, aiState.cooldown - dt);

  // difficulty tuning
  let punchChance = 0.010; // medium
  let cooldownTime = 0.75;

  if(aiState.mode === "easy"){ punchChance = 0.007; cooldownTime = 0.95; }
  if(aiState.mode === "hard"){ punchChance = 0.016; cooldownTime = 0.55; }

  // punch only if in range
  const inRange = canHit(bot.position, player.position, 2.0);

  if(inRange && aiState.cooldown === 0 && Math.random() < punchChance){
    aiState.cooldown = cooldownTime;

    // if player guarding, reduce effect
    const guarded = !!handState.guard;

    const dmg = guarded ? 3 : 6;
    aiState.lastAction = "punch";
    onBotPunch(dmg);
    setTimeout(()=>{ aiState.lastAction = "idle"; }, 200);
  }
}
