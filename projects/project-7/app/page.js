"use client";

import { useEffect, useRef, useState } from "react";
import { createThreeScene } from "../lib/threeScene.js";
import { initHandTracking } from "../lib/handTracking.js";
import { clamp, calcPunchDamage, canHit, isKO } from "../lib/boxingLogic.js";
import { createBotAI, botUpdate } from "../lib/botAI.js";

export default function Page(){
  const mountRef = useRef(null);
  const videoRef = useRef(null);

  const [status, setStatus] = useState("Ready");
  const [hp, setHp] = useState({ player: 100, bot: 100 });
  const [guard, setGuard] = useState(false);

  const threeRef = useRef(null);
  const streamRef = useRef(null);

  const handStateRef = useRef({
    guard:false,
    leftPunch:false,
    rightPunch:false,
    leftSpeed:0,
    rightSpeed:0
  });

  const aiRef = useRef(createBotAI());

  // Setup Three scene
  useEffect(() => {
    if(!mountRef.current) return;

    const three = createThreeScene({ mountEl: mountRef.current });
    threeRef.current = three;

    const onResize = () => three.resize();
    window.addEventListener("resize", onResize);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dt = three.clock.getDelta();

      // Bot update
      botUpdate({
        dt,
        bot: three.bot,
        player: three.player,
        handState: handStateRef.current,
        aiState: aiRef.current,
        onBotPunch: (dmg) => {
          setHp(prev => {
            const next = { ...prev };
            next.player = clamp(next.player - dmg, 0, 100);
            return next;
          });
          setStatus(dmg <= 3 ? "Blocked bot punch!" : "Bot punched!");
          setTimeout(()=>setStatus("Fighting..."), 350);
        }
      });

      // End check
      // (we don't stop loop, just show status)
      three.render();
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      three.dispose();
      threeRef.current = null;
    };
  }, []);

  // Player Punch handler
  function playerPunch(side){
    const three = threeRef.current;
    if(!three) return;

    const distOK = canHit(three.player.position, three.bot.position, 2.0);
    if(!distOK){
      setStatus("Punch missed!");
      setTimeout(()=>setStatus("Fighting..."), 250);
      return;
    }

    const speed = side === "left" ? handStateRef.current.leftSpeed : handStateRef.current.rightSpeed;
    const dmg = calcPunchDamage(side, speed);

    setHp(prev => {
      const next = { ...prev };
      next.bot = clamp(next.bot - dmg, 0, 100);
      return next;
    });

    setStatus(`You punched (${side})! -${dmg}`);
    setTimeout(()=>setStatus("Fighting..."), 300);
  }

  // Start camera + hand tracking
  async function start(){
    try{
      setStatus("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setStatus("Loading hand tracking...");

      await initHandTracking({
        videoEl: videoRef.current,
        onState: (s) => {
          handStateRef.current = s;
          setGuard(!!s.guard);

          // trigger punches
          if(s.leftPunch) playerPunch("left");
          if(s.rightPunch) playerPunch("right");
        }
      });

      setStatus("Fighting...");
    }catch(e){
      console.error(e);
      setStatus("Error: " + e.message);
    }
  }

  // Stop camera
  function stop(){
    try{
      const s = streamRef.current;
      if(s){
        s.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setStatus("Stopped");
    }catch(e){
      setStatus("Stop error: " + e.message);
    }
  }

  // KO state
  const playerKO = isKO(hp.player);
  const botKO = isKO(hp.bot);

  return (
    <div style={{ height:"100vh", display:"grid", gridTemplateRows:"auto 1fr" }}>
      <div className="hud">
        <div>
          <div style={{ fontWeight: 900 }}>🥊 Hand Boxing (Web)</div>
          <div className="small">{status}</div>
          <div className="small">Guard: {guard ? "ON" : "OFF"}</div>
        </div>

        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div className="pill">
            <div>
              <div className="small">Player</div>
              <div style={{ fontWeight: 900 }}>{hp.player}</div>
            </div>
            <div className="barWrap">
              <div className="bar" style={{ width: `${hp.player}%`, background: "var(--green)" }} />
            </div>
          </div>

          <div className="pill">
            <div>
              <div className="small">Bot</div>
              <div style={{ fontWeight: 900 }}>{hp.bot}</div>
            </div>
            <div className="barWrap">
              <div className="bar" style={{ width: `${hp.bot}%`, background: "var(--red)" }} />
            </div>
          </div>

          <button className="btn btnPrimary" onClick={start}>
            Start Camera
          </button>
          <button className="btn" style={{ background:"rgba(255,255,255,.10)", color:"#fff" }} onClick={stop}>
            Stop
          </button>
        </div>
      </div>

      <div className="stage" ref={mountRef}>
        <video ref={videoRef} className="videoPreview" playsInline muted />
        {(playerKO || botKO) && (
          <div style={{
            position:"absolute", inset:0,
            display:"grid", placeItems:"center",
            background:"rgba(0,0,0,.55)"
          }}>
            <div className="pill" style={{ padding: 18, borderRadius: 18 }}>
              <div style={{ fontWeight: 1000, fontSize: 22 }}>
                {botKO ? "✅ You Win! KO" : "❌ You Lose! KO"}
              </div>
              <div className="small" style={{ marginTop: 6 }}>
                Refresh karo ya HP reset karne ka button next update me add kar denge.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
