import { useState, useEffect, useRef, useCallback } from "react";

const LIFE_EXP = 80;

function CircularProgress({ percent }) {
  const r = 88, cx = 110, cy = 110;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#ff1744" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="url(#pg)" strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{
          transform: `rotate(-90deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: "stroke-dashoffset 2.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </svg>
  );
}

function LifeGrid({ age }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const W = wrap.offsetWidth || 580;
    canvas.width = W;
    const ctx = canvas.getContext("2d");
    const TOTAL = LIFE_EXP * 12;
    const LIVED = Math.min(age * 12, TOTAL);
    const DOT = 7, GAP = 3, STEP = DOT + GAP;
    const COLS = Math.floor(W / STEP);
    const ROWS = Math.ceil(TOTAL / COLS);
    canvas.height = ROWS * STEP + 16;
    ctx.clearRect(0, 0, W, canvas.height);

    for (let i = 0; i < TOTAL; i++) {
      const col = i % COLS, row = Math.floor(i / COLS);
      const x = col * STEP + DOT / 2, y = row * STEP + DOT / 2 + 4;
      ctx.beginPath();
      ctx.arc(x, y, DOT / 2, 0, Math.PI * 2);
      if (i < LIVED) {
        const t = i / Math.max(LIVED - 1, 1);
        const r2 = 255, g2 = Math.round(107 - t * 80), b2 = Math.round(53 - t * 40);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${0.55 + t * 0.45})`;
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.052)";
      }
      ctx.fill();
    }

    const milestones = [
      { yr: 0, label: "Birth" },
      { yr: 20, label: "20" },
      { yr: 40, label: "40" },
      { yr: 60, label: "60" },
      { yr: LIFE_EXP, label: `${LIFE_EXP}` },
    ];
    ctx.font = "9px 'Courier New', monospace";
    milestones.forEach(({ yr, label }) => {
      const mIdx = yr * 12, row = Math.floor(mIdx / COLS);
      const y2 = row * STEP + 4;
      const col0 = mIdx % COLS;
      const x2 = col0 * STEP;
      if (yr === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillText(label, 0, y2 + DOT);
      } else {
        ctx.fillStyle = "rgba(255,107,53,0.45)";
        ctx.fillText(label + (yr !== LIFE_EXP ? " yr" : ""), x2, y2 + DOT);
      }
    });
  }, [age]);

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function TimelineBar({ age, stYrs }) {
  const sleepYrs = Math.round((8 * 365 * age) / (24 * 365));
  const workYrs = Math.round((8 * 365 * Math.max(0, age - 22)) / (24 * 365));
  const freeYrs = Math.max(0, age - sleepYrs - stYrs - workYrs);
  const items = [
    { label: "Sleep", yrs: sleepYrs, color: "rgba(120,80,255,0.7)" },
    { label: "Screens", yrs: stYrs, color: "rgba(255,50,80,0.8)" },
    { label: "Work", yrs: workYrs, color: "rgba(255,140,30,0.7)" },
    { label: "Free", yrs: freeYrs, color: "rgba(30,200,120,0.7)" },
  ];
  const total = items.reduce((s, x) => s + x.yrs, 0) || 1;
  return (
    <div style={{ width: "100%", marginBottom: 8 }}>
      <div style={{ display: "flex", height: 24, borderRadius: 2, overflow: "hidden", gap: 1 }}>
        {items.map(({ label, yrs, color }) => (
          <div key={label} style={{ flex: yrs / total, background: color, minWidth: yrs > 0 ? 2 : 0 }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {items.map(({ label, yrs, color }) => (
          <span key={label} style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 1, background: color }} />
            {label} ~{yrs}yr
          </span>
        ))}
      </div>
    </div>
  );
}

function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.width = window.innerWidth;
    el.height = window.innerHeight;
    const ctx = el.getContext("2d");
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * el.width, y: Math.random() * el.height,
      r: Math.random() * 1.1 + 0.2,
      vx: (Math.random() - 0.5) * 0.18, vy: -(Math.random() * 0.2 + 0.05),
      a: Math.random() * 0.28 + 0.04,
    }));
    let id;
    const draw = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = el.height; p.x = Math.random() * el.width; }
        if (p.x < 0) p.x = el.width;
        if (p.x > el.width) p.x = 0;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { el.width = window.innerWidth; el.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", onResize); };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

export default function App() {
  const [scene, setScene] = useState(1);
  const [age, setAge] = useState("");
  const [screenTime, setScreenTime] = useState("");
  const [loadPct, setLoadPct] = useState(0);
  const [countPct, setCountPct] = useState(0);
  const [muted, setMuted] = useState(false);
  const [fading, setFading] = useState(false);

  const acRef = useRef(null);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const ageN = Math.max(1, Math.min(120, parseInt(age) || 1));
  const stN = Math.max(0, parseFloat(screenTime) || 0);
  const pct = Math.min(100, Math.round((ageN / LIFE_EXP) * 100));
  const yrsLeft = Math.max(0, LIFE_EXP - ageN);
  const stYrs = Math.round((stN * 365 * ageN) / (24 * 365));

  const getAC = useCallback(() => {
    if (!acRef.current)
      acRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return acRef.current;
  }, []);

  const playTick = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ac = getAC();
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.034), ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.0038));
      const s = ac.createBufferSource();
      s.buffer = buf;
      const g = ac.createGain();
      g.gain.value = 0.11;
      s.connect(g); g.connect(ac.destination); s.start();
    } catch (e) {}
  }, [getAC]);

  const playBeat = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ac = getAC();
      [0, 0.21].forEach(d => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = 50;
        g.gain.setValueAtTime(0, ac.currentTime + d);
        g.gain.linearRampToValueAtTime(0.48, ac.currentTime + d + 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + d + 0.33);
        o.connect(g); g.connect(ac.destination);
        o.start(ac.currentTime + d); o.stop(ac.currentTime + d + 0.36);
      });
    } catch (e) {}
  }, [getAC]);

  useEffect(() => {
    const iv = setInterval(playTick, 1000);
    return () => clearInterval(iv);
  }, [playTick]);

  const go = useCallback((n) => {
    setFading(true);
    setTimeout(() => { setScene(n); setFading(false); }, 460);
  }, []);

  useEffect(() => {
    if (scene !== 3) return;
    setLoadPct(0);
    playBeat();
    const t0 = Date.now(), dur = 3500;
    const iv = setInterval(() => {
      const p = Math.min(100, ((Date.now() - t0) / dur) * 100);
      setLoadPct(Math.round(p));
      if (p >= 100) { clearInterval(iv); setTimeout(() => go(4), 520); }
    }, 38);
    return () => clearInterval(iv);
  }, [scene]);

  useEffect(() => {
    if (scene !== 4) return;
    setCountPct(0);
    playBeat();
    const target = pct, t0 = Date.now(), dur = 2800;
    const iv = setInterval(() => {
      const t = Math.min(1, (Date.now() - t0) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      setCountPct(Math.round(ease * target));
      if (t >= 1) clearInterval(iv);
    }, 38);
    return () => clearInterval(iv);
  }, [scene]);

  const calc = () => {
    if (!age || ageN < 1) return;
    getAC();
    go(3);
  };

  const restart = () => { setAge(""); setScreenTime(""); go(1); };

  const fade = {
    opacity: fading ? 0 : 1,
    transform: fading ? "translateY(20px) scale(0.985)" : "translateY(0) scale(1)",
    transition: "opacity 0.44s ease, transform 0.44s ease",
  };

  const TF = { fontFamily: "Georgia, 'Times New Roman', serif" };
  const MF = { fontFamily: "'Courier New', 'Lucida Console', monospace" };

  const Btn = ({ children, onClick, full, red }) => (
    <button
      onClick={onClick}
      style={{
        width: full ? "100%" : "auto",
        background: red ? "rgba(255,34,68,0.07)" : "transparent",
        border: `1px solid ${red ? "rgba(255,34,68,0.25)" : "rgba(255,255,255,0.14)"}`,
        color: red ? "#ff2244" : "rgba(255,255,255,0.48)",
        padding: full ? "16px" : "12px 38px",
        letterSpacing: "0.3em", fontSize: "10px", cursor: "pointer",
        textTransform: "uppercase", borderRadius: "3px",
        transition: "all 0.3s ease", ...MF,
      }}
      onMouseEnter={e => {
        if (red) { e.currentTarget.style.background = "rgba(255,34,68,0.16)"; e.currentTarget.style.borderColor = "rgba(255,34,68,0.6)"; }
        else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.44)"; e.currentTarget.style.color = "#fff"; }
      }}
      onMouseLeave={e => {
        if (red) { e.currentTarget.style.background = "rgba(255,34,68,0.07)"; e.currentTarget.style.borderColor = "rgba(255,34,68,0.25)"; }
        else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "rgba(255,255,255,0.48)"; }
      }}
    >{children}</button>
  );

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.026)",
    border: "1px solid rgba(255,255,255,0.09)", borderRadius: "3px",
    padding: "14px 18px", color: "#fff", fontSize: 26, ...TF,
    transition: "border-color 0.3s",
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#030303", color: "#fff", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glitch {
          0%   { clip-path: inset(0 0 97% 0);  transform: translateX(-6px); }
          12%  { clip-path: inset(18% 0 58% 0); transform: translateX(6px);  }
          25%  { clip-path: inset(62% 0 22% 0); transform: translateX(-4px); }
          38%  { clip-path: inset(32% 0 48% 0); transform: translateX(5px);  }
          52%  { clip-path: inset(78% 0 8%  0); transform: translateX(-5px); }
          65%  { clip-path: inset(6%  0 82% 0); transform: translateX(4px);  }
          78%  { clip-path: inset(45% 0 38% 0); transform: translateX(-3px); }
          100% { clip-path: inset(0);            transform: translateX(0);    }
        }
        @keyframes breathe { 0%, 100% { opacity: .18; } 50% { opacity: .65; } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input:focus { outline: none; }
        body { background: #030303; }
      `}</style>

      <Particles />

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 85% 85% at 50% 45%, transparent 25%, rgba(0,0,0,0.72) 100%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.01) 3px,rgba(0,0,0,0.01) 4px)", pointerEvents: "none", zIndex: 1 }} />

      <button
        onClick={() => setMuted(m => !m)}
        style={{ position: "fixed", top: 20, right: 20, zIndex: 50, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.28)", borderRadius: "3px", padding: "7px 14px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.2em", ...MF }}
      >{muted ? "○ muted" : "● sound"}</button>

      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7, zIndex: 50 }}>
        {Array.from({ length: 9 }, (_, i) => i + 1).map(s => (
          <div key={s} style={{ height: 2, width: s === scene ? 22 : 6, borderRadius: 1, background: s < scene ? "rgba(255,50,50,0.5)" : s === scene ? "#ff2244" : "rgba(255,255,255,0.08)", transition: "all 0.4s ease" }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>

        {scene === 1 && (
          <div style={{ ...fade, textAlign: "center", maxWidth: 560 }}>
            <div style={{ width: 1, height: 56, background: "rgba(255,255,255,0.1)", margin: "0 auto 52px", animation: "fadeUp 1.2s ease both" }} />
            <p style={{ ...TF, fontSize: "clamp(28px,6vw,52px)", fontWeight: 300, letterSpacing: "0.1em", color: "rgba(255,255,255,0.92)", lineHeight: 1.3, marginBottom: 18, animation: "fadeUp 1.5s ease 0.3s both" }}>
              Time is not infinite.
            </p>
            <p style={{ ...TF, fontSize: "clamp(18px,3.5vw,28px)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.28)", letterSpacing: "0.07em", marginBottom: 76, animation: "fadeUp 1.5s ease 2s both" }}>
              But it feels like it is.
            </p>
            <div style={{ animation: "fadeUp 1.5s ease 3.4s both" }}>
              <Btn onClick={() => go(2)}>Begin ↓</Btn>
            </div>
          </div>
        )}

        {scene === 2 && (
          <div style={{ ...fade, width: "100%", maxWidth: 430 }}>
            <p style={{ ...MF, fontSize: "10px", letterSpacing: "0.42em", color: "rgba(255,255,255,0.2)", marginBottom: 46, textAlign: "center", textTransform: "uppercase" }}>Your life, calculated</p>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", ...MF, fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.26)", marginBottom: 10, textTransform: "uppercase" }}>Your Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="21" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.32)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", ...MF, fontSize: "10px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.26)", marginBottom: 10, textTransform: "uppercase" }}>Daily Screen Time (hrs)</label>
              <input type="number" value={screenTime} onChange={e => setScreenTime(e.target.value)} placeholder="6" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.32)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"} />
            </div>
            <p style={{ ...MF, fontSize: "10px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em", marginBottom: 38 }}>Demo: Age 21 · Screen time 6 hrs/day</p>
            <Btn onClick={calc} full red>Calculate My Life →</Btn>
          </div>
        )}

        {scene === 3 && (
          <div style={{ ...fade, textAlign: "center", maxWidth: 360 }}>
            <p style={{ ...MF, fontSize: "11px", letterSpacing: "0.34em", color: "rgba(255,255,255,0.28)", marginBottom: 64, textTransform: "uppercase", animation: "breathe 2s ease infinite" }}>Analyzing your life…</p>
            <div style={{ position: "relative", height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 18, borderRadius: 1 }}>
              <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${loadPct}%`, background: "linear-gradient(90deg,#ff6b35,#ff2244)", transition: "width 0.06s linear", borderRadius: 1 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ ...MF, fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}>{loadPct}%</span>
              <span style={{ ...MF, fontSize: "10px", color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>{LIFE_EXP} year lifespan</span>
            </div>
          </div>
        )}

        {scene === 4 && (
          <div style={{ ...fade, textAlign: "center" }}>
            <p style={{ ...MF, fontSize: "10px", letterSpacing: "0.4em", color: "rgba(255,255,255,0.2)", marginBottom: 30, textTransform: "uppercase" }}>You have used</p>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
              <CircularProgress percent={countPct} />
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span style={{ ...TF, fontSize: "clamp(54px,13vw,90px)", fontWeight: 700, color: "#ff2244", lineHeight: 1, display: "block" }}>{countPct}</span>
                <span style={{ ...TF, fontSize: 18, color: "rgba(255,34,68,0.5)", fontWeight: 300 }}>percent</span>
              </div>
            </div>
            <p style={{ ...TF, fontSize: "clamp(14px,3vw,20px)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.3)", marginBottom: 34 }}>of your life</p>
            <div style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, maxWidth: 380, margin: "0 auto 44px", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${countPct}%`, background: "linear-gradient(90deg,#ff6b35,#ff2244)", borderRadius: 2, transition: "width 2.8s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
            <Btn onClick={() => go(5)}>See breakdown →</Btn>
          </div>
        )}

        {scene === 5 && (
          <div style={{ ...fade, textAlign: "center", width: "100%", maxWidth: 620 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, marginBottom: 36 }}>
              {[
                { l: "Years lived", v: ageN, c: "#ff6b35" },
                { l: "Years remaining", v: yrsLeft, c: "rgba(255,255,255,0.75)" },
                { l: "Years on screens", v: stYrs, c: "#ff2244" },
                { l: "Life expectancy", v: `${LIFE_EXP}`, c: "rgba(255,255,255,0.24)" },
              ].map(({ l, v, c }, i) => (
                <div key={i} style={{ padding: "18px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 5 }}>
                  <div style={{ ...MF, fontSize: "9px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)", marginBottom: 10, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ ...TF, fontSize: "clamp(28px,6vw,46px)", fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 12, padding: "16px", background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 5 }}>
              <p style={{ ...MF, fontSize: "9px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 14 }}>How your years were spent</p>
              <TimelineBar age={ageN} stYrs={stYrs} />
            </div>
            <div style={{ padding: "16px", background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 5, marginBottom: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ ...MF, fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#ff6b35" }} /> lived months
                </span>
                <span style={{ ...MF, fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>1 dot = 1 month</span>
                <span style={{ ...MF, fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  remaining <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </span>
              </div>
              <LifeGrid age={ageN} />
            </div>
            <Btn onClick={() => go(6)}>Continue →</Btn>
          </div>
        )}

        {scene === 6 && (
          <div style={{ ...fade, textAlign: "center", maxWidth: 560 }}>
            <p style={{ ...TF, fontSize: "clamp(72px,18vw,130px)", fontWeight: 700, letterSpacing: "0.02em", color: "#fff", lineHeight: 1, marginBottom: 40, animation: !fading ? "glitch 0.58s steps(1) 0.25s both" : "none" }}>
              WAIT.
            </p>
            <p style={{ ...TF, fontSize: "clamp(18px,4vw,30px)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 72 }}>
              You thought you had time.
            </p>
            <Btn onClick={() => go(7)}>Face it →</Btn>
          </div>
        )}

        {scene === 7 && (
          <div style={{ ...fade, textAlign: "center", maxWidth: 540 }}>
            <div style={{ width: 32, height: 1, background: "rgba(255,34,68,0.38)", margin: "0 auto 44px" }} />
            <p style={{ ...TF, fontSize: "clamp(22px,5vw,42px)", fontWeight: 300, color: "rgba(255,255,255,0.88)", lineHeight: 1.55, marginBottom: 12 }}>Most of your life…</p>
            <p style={{ ...TF, fontSize: "clamp(22px,5vw,42px)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.24)", lineHeight: 1.55, marginBottom: 64 }}>is already behind you.</p>
            <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.07)", margin: "0 auto 52px" }} />
            <Btn onClick={() => go(8)}>→</Btn>
          </div>
        )}

        {scene === 8 && (
          <div style={{ ...fade, textAlign: "center", maxWidth: 520 }}>
            <p style={{ ...TF, fontSize: "clamp(16px,3.5vw,24px)", fontWeight: 300, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", marginBottom: 22 }}>This is not a prediction.</p>
            <p style={{ ...TF, fontSize: "clamp(22px,5vw,38px)", fontWeight: 400, color: "rgba(255,255,255,0.88)", letterSpacing: "0.04em", marginBottom: 80 }}>This is your reality.</p>
            <Btn onClick={() => go(9)}>→</Btn>
          </div>
        )}

        {scene === 9 && (
          <div style={{ ...fade, textAlign: "center", maxWidth: 520 }}>
            <p style={{ ...TF, fontSize: "clamp(24px,6vw,46px)", fontWeight: 300, color: "rgba(255,255,255,0.62)", lineHeight: 1.4, marginBottom: 8 }}>What will you do</p>
            <p style={{ ...TF, fontSize: "clamp(24px,6vw,46px)", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.2)", lineHeight: 1.4, marginBottom: 80 }}>with the rest?</p>
            <Btn onClick={restart}>↺ Restart</Btn>
          </div>
        )}

      </div>
    </div>
  );
}
