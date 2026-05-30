"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/chat";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [
    "Tell me about yourself",
    "What is your superpower?",
    "Top 3 areas to grow in?",
    "Misconception about you?",
    "Your best project",
    "Why should we hire you?",
  ];

  const badges = [
    { icon: "🎓", label: "IIT (ISM) Dhanbad", color: "badge-blue" },
    { icon: "🤖", label: "AI Engineer", color: "badge-violet" },
    { icon: "💻", label: "400+ LeetCode", color: "badge-emerald" },
    { icon: "🚀", label: "RAG Systems", color: "badge-amber" },
    { icon: "📈", label: "200M+ Organic Views", color: "badge-rose" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(customQuestion?: string) {
    const finalQuestion = customQuestion || question;
    if (!finalQuestion.trim()) return;

    const userMessage: Message = { role: "user", content: finalQuestion };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: finalQuestion, chatHistory: updatedMessages }),
      });

      const data = await response.json();
      if (!data.answer) throw new Error("No answer returned");

      const aiMessage: Message = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, aiMessage]);

      // ── Browser Speech Synthesis (replaces ElevenLabs) ──
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(data.answer);
        speech.rate   = 1;
        speech.pitch  = 1;
        speech.volume = 1;

        // Pick male voice: David/Mark/Guy → Google en → Microsoft en → any English
        const pickVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find((v) =>
            v.name.toLowerCase().includes("david") ||
            v.name.toLowerCase().includes("mark")  ||
            v.name.toLowerCase().includes("guy")
          );
          const google    = voices.find((v) => v.name.toLowerCase().includes("google")    && v.lang.startsWith("en"));
          const microsoft = voices.find((v) => v.name.toLowerCase().includes("microsoft") && v.lang.startsWith("en"));
          speech.voice = maleVoice ?? google ?? microsoft ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
          if (voiceEnabled) { window.speechSynthesis.speak(speech); }
        };

        // Voices may not be loaded yet on first call
        if (window.speechSynthesis.getVoices().length > 0) {
          pickVoice();
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            pickVoice();
            window.speechSynthesis.onvoiceschanged = null;
          };
        }
      }
    } catch (error) {
      console.error("CHAT ERROR:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setIsListening(false);
      inputRef.current?.focus();
    };
    recognition.onerror = (event: any) => {
      console.log("Speech Error:", event.error);
      alert(`Speech Error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg-deep:        #060b18;
          --bg-panel:       rgba(8, 15, 35, 0.92);
          --bg-card:        rgba(255,255,255,0.04);
          --border:         rgba(255,255,255,0.08);
          --border-accent:  rgba(99,102,241,0.35);
          --text-primary:   #eef2ff;
          --text-secondary: #8896c0;
          --text-muted:     #3d4e72;
          --cyan:           #38bdf8;
          --indigo:         #6366f1;
          --violet:         #8b5cf6;
          --green:          #10b981;
          --user-bg:        linear-gradient(135deg,#3b82f6,#6366f1);
          --ai-bg:          rgba(255,255,255,0.05);
          --mono:           'JetBrains Mono', monospace;
          --sans:           'DM Sans', sans-serif;
          --radius-shell:   20px;
          --radius-bubble:  16px;
        }

        html, body {
          height: 100%;
          background: var(--bg-deep);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
        }

        /* ═══════════════════════════════════════
           ROOT WRAPPER
        ═══════════════════════════════════════ */
        .cr {
          min-height: 100dvh;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(ellipse 70% 45% at 15% 0%,   rgba(99,102,241,.13) 0%, transparent 55%),
            radial-gradient(ellipse 55% 35% at 85% 100%,  rgba(56,189,248,.09) 0%, transparent 55%),
            var(--bg-deep);
        }

        /* ═══════════════════════════════════════
           SHELL  — desktop card
        ═══════════════════════════════════════ */
        .cs {
          width: 100%;
          max-width: 1300px;
          height: 95dvh;
          height: 95vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-panel);
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
          border: 1px solid var(--border);
          border-radius: var(--radius-shell);
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 40px 100px rgba(0,0,0,.65),
            0 0 140px rgba(99,102,241,.07);
        }

        /* ═══════════════════════════════════════
           TOP BAR
        ═══════════════════════════════════════ */
        .tb {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 24px;
          border-bottom: 1px solid var(--border);
          background: rgba(0,0,0,.22);
          flex-shrink: 0;
          gap: 12px;
        }

        .tb-brand { display: flex; align-items: center; gap: 11px; min-width: 0; }

        .tb-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--indigo), var(--cyan));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
          box-shadow: 0 0 18px rgba(99,102,241,.45);
        }

        .tb-name {
          font-family: var(--mono); font-size: 14px; font-weight: 700;
          color: var(--text-primary); letter-spacing: -.015em;
          white-space: nowrap;
        }

        .tb-sub {
          font-size: 10.5px; color: var(--text-secondary);
          text-transform: uppercase; letter-spacing: .05em;
          margin-top: 1px; white-space: nowrap;
        }

        .tb-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          background: rgba(16,185,129,.1);
          border: 1px solid rgba(16,185,129,.25);
          border-radius: 999px; flex-shrink: 0;
        }

        .tb-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--green);
          animation: pdot 2s infinite;
        }

        @keyframes pdot {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.4); }
          50%      { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
        }

        .tb-online { font-size: 11px; color: var(--green); font-weight: 600; letter-spacing: .05em; text-transform: uppercase; }

        /* ═══════════════════════════════════════
           HERO
        ═══════════════════════════════════════ */
        .hero {
          padding: 20px 24px 18px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          background: linear-gradient(180deg, rgba(99,102,241,.05) 0%, transparent 100%);
        }

        .hero-name {
          font-family: var(--mono); font-weight: 700;
          font-size: clamp(18px, 2.2vw, 26px);
          color: var(--text-primary); letter-spacing: -.025em;
          line-height: 1.2; margin-bottom: 5px;
        }

        .hero-name span {
          background: linear-gradient(90deg, var(--cyan), var(--indigo));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-bio {
          font-size: clamp(12px, 1.2vw, 13.5px); color: var(--text-secondary);
          line-height: 1.55; margin-bottom: 14px; max-width: 640px;
        }

        .badges { display: flex; flex-wrap: wrap; gap: 7px; }

        .badge {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 999px;
          font-size: 11.5px; font-weight: 500; border: 1px solid;
          transition: transform .15s, box-shadow .15s; cursor: default;
          white-space: nowrap;
        }
        .badge:hover { transform: translateY(-1px); }

        .badge-blue    { background:rgba(59,130,246,.12);  color:#93c5fd; border-color:rgba(59,130,246,.28); }
        .badge-violet  { background:rgba(139,92,246,.12);  color:#c4b5fd; border-color:rgba(139,92,246,.28); }
        .badge-emerald { background:rgba(16,185,129,.12);  color:#6ee7b7; border-color:rgba(16,185,129,.28); }
        .badge-amber   { background:rgba(245,158,11,.12);  color:#fcd34d; border-color:rgba(245,158,11,.28); }
        .badge-rose    { background:rgba(244,63,94,.12);   color:#fda4af; border-color:rgba(244,63,94,.28); }

        .badge-blue:hover    { box-shadow: 0 0 14px rgba(59,130,246,.2); }
        .badge-violet:hover  { box-shadow: 0 0 14px rgba(139,92,246,.2); }
        .badge-emerald:hover { box-shadow: 0 0 14px rgba(16,185,129,.2); }
        .badge-amber:hover   { box-shadow: 0 0 14px rgba(245,158,11,.2); }
        .badge-rose:hover    { box-shadow: 0 0 14px rgba(244,63,94,.2); }

        /* ═══════════════════════════════════════
           CHIPS BAR  — horizontal scroll on mobile
        ═══════════════════════════════════════ */
        .chips-bar {
          padding: 11px 24px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0; background: rgba(0,0,0,.1);
          overflow-x: auto; -webkit-overflow-scrolling: touch;
        }

        .chips-bar::-webkit-scrollbar { display: none; }

        .chips-lbl {
          font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
          color: var(--text-muted); font-weight: 600; flex-shrink: 0;
        }

        .chip {
          padding: 5px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 999px;
          color: var(--text-secondary);
          font-size: 12px; font-family: var(--sans);
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: all .18s ease;
        }
        .chip:hover {
          background: rgba(99,102,241,.16);
          border-color: rgba(99,102,241,.45);
          color: var(--text-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(99,102,241,.15);
        }
        .chip:active { transform: translateY(0); }

        /* ═══════════════════════════════════════
           MESSAGES
        ═══════════════════════════════════════ */
        .msgs {
          flex: 1; overflow-y: auto;
          padding: 24px 24px 8px;
          display: flex; flex-direction: column; gap: 18px;
          scroll-behavior: smooth;
        }

        .msgs::-webkit-scrollbar { width: 3px; }
        .msgs::-webkit-scrollbar-track { background: transparent; }
        .msgs::-webkit-scrollbar-thumb { background: rgba(255,255,255,.07); border-radius: 999px; }

        .empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; text-align: center; padding: 32px;
        }
        .empty-ico { font-size: 36px; opacity: .35; }
        .empty-ttl { font-size: 15px; color: var(--text-secondary); font-weight: 500; }
        .empty-sub { font-size: 12.5px; color: var(--text-muted); max-width: 280px; line-height: 1.6; }

        .mrow {
          display: flex;
          animation: min .25s ease forwards;
        }
        .mrow.user      { justify-content: flex-end; }
        .mrow.assistant { justify-content: flex-start; }

        @keyframes min {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .mav {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0; margin-top: 18px;
        }
        .mav.ai   { background:linear-gradient(135deg,var(--indigo),var(--cyan)); margin-right:9px; box-shadow:0 0 12px rgba(99,102,241,.35); }
        .mav.usr  { background:rgba(99,102,241,.18); border:1px solid rgba(99,102,241,.3); margin-left:9px; order:2; }

        .mwrap { display:flex; flex-direction:column; max-width:72%; }
        .mrow.user .mwrap { align-items:flex-end; }

        .mlbl {
          font-size: 9.5px; font-weight: 600; letter-spacing: .06em;
          text-transform: uppercase; color: var(--text-muted);
          margin-bottom: 4px; padding: 0 2px;
        }

        .bubble {
          padding: 11px 16px; border-radius: var(--radius-bubble);
          font-size: 13.5px; line-height: 1.65; word-break: break-word;
        }
        .bubble.u {
          background: var(--user-bg); color:#fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 18px rgba(99,102,241,.25);
        }
        .bubble.a {
          background: var(--ai-bg); color: var(--text-primary);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
          backdrop-filter: blur(8px);
        }

        .tdots { display:flex; align-items:center; gap:5px; padding: 12px 16px; }
        .td {
          width:7px; height:7px; border-radius:50%;
          animation: tbounce 1.3s infinite ease-in-out;
        }
        .td:nth-child(1) { background:var(--cyan); }
        .td:nth-child(2) { background:var(--indigo); animation-delay:.2s; }
        .td:nth-child(3) { background:var(--violet); animation-delay:.4s; }

        @keyframes tbounce {
          0%,80%,100% { transform:scale(.7); opacity:.5; }
          40%          { transform:scale(1.15); opacity:1; }
        }

        /* ═══════════════════════════════════════
           INPUT AREA
        ═══════════════════════════════════════ */
        .ia {
          padding: 14px 20px 18px;
          border-top: 1px solid var(--border);
          background: rgba(0,0,0,.15);
          flex-shrink: 0;
        }

        .irow {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,.04);
          border: 1px solid var(--border);
          border-radius: 13px;
          padding: 5px 7px 5px 12px;
          transition: border-color .2s, box-shadow .2s;
        }
        .irow:focus-within {
          border-color: var(--border-accent);
          box-shadow: 0 0 0 3px rgba(99,102,241,.1), 0 4px 24px rgba(99,102,241,.07);
        }

        .mic {
          width: 38px; height: 38px; border-radius: 10px;
          background: transparent; border: 1px solid var(--border);
          color: var(--text-secondary); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; transition: all .18s; flex-shrink: 0;
        }
        .mic:hover { background:rgba(139,92,246,.15); border-color:rgba(139,92,246,.45); color:#c4b5fd; }
        .mic.on    { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.5); color:#fca5a5; animation:mpulse 1s infinite; }

        @keyframes mpulse {
          0%,100% { box-shadow:0 0 0 0 rgba(239,68,68,.35); }
          50%      { box-shadow:0 0 0 6px rgba(239,68,68,0); }
        }

        .ci {
          flex:1; background:transparent; border:none; outline:none;
          color: var(--text-primary); font-family: var(--sans);
          font-size: 14px; padding: 8px 4px;
          caret-color: var(--cyan);
        }
        .ci::placeholder { color: var(--text-muted); }

        .sbtn {
          height: 40px; padding: 0 18px; border-radius: 10px;
          background: linear-gradient(135deg,#3b82f6,#6366f1);
          border: none; color: #fff;
          font-family: var(--sans); font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          flex-shrink: 0; letter-spacing: .01em;
          box-shadow: 0 2px 12px rgba(99,102,241,.3);
          transition: all .18s; white-space: nowrap;
        }
        .sbtn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,.45); background:linear-gradient(135deg,#2563eb,#4f46e5); }
        .sbtn:active:not(:disabled) { transform:translateY(0); }
        .sbtn:disabled { opacity:.45; cursor:not-allowed; }

        /* Mobile: hide send label, show icon only */
        .sbtn-label { display: inline; }
        .sbtn-ico   { display: none; }

        .ifooter {
          margin-top: 9px; text-align:center;
          font-size: 10.5px; color: var(--text-muted); letter-spacing:.02em;
        }

        /* ═══════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ═══════════════════════════════════════ */

        /* ── Large desktop: more breathing room ── */
        @media (min-width: 1200px) {
          .cr { padding: 20px 32px; }
          .hero { padding: 24px 32px 20px; }
          .chips-bar { padding: 13px 32px; }
          .msgs { padding: 28px 32px 8px; }
          .ia { padding: 16px 28px 22px; }
          .tb { padding: 14px 32px; }
          .mwrap { max-width: 68%; }
          .bubble { font-size: 14px; }
        }

        /* ── Tablet (768px–1024px): minor tightening ── */
        @media (max-width: 1024px) {
          .hero-bio { display: none; }
          .mwrap { max-width: 78%; }
        }

        /* ── Mobile-first overrides (<768px) ── */
        @media (max-width: 767px) {
          /* Root: flush to edges, no outer padding */
          .cr {
            padding: 0;
            align-items: stretch;
            background:
              radial-gradient(ellipse 120% 40% at 50% 0%, rgba(99,102,241,.15) 0%, transparent 50%),
              var(--bg-deep);
          }

          /* Shell: full screen, no card border-radius */
          .cs {
            max-width: 100%;
            height: 100dvh;
            height: 100vh;
            border-radius: 0;
            border: none;
            box-shadow: none;
          }

          /* Top bar: compact */
          .tb { padding: 10px 16px; }
          .tb-sub { display: none; }
          .tb-name { font-size: 13px; }
          .tb-icon { width:32px; height:32px; font-size:15px; }
          .tb-online { display: none; }

          /* Hero: smaller */
          .hero { padding: 14px 16px 12px; }
          .hero-bio { display: none; }
          .hero-name { font-size: 18px; margin-bottom: 10px; }
          .badge { font-size: 10.5px; padding: 3px 10px; }

          /* Chips: horizontal scroll, no label */
          .chips-bar { padding: 10px 16px; gap: 7px; }
          .chips-lbl { display: none; }
          .chip { font-size: 11.5px; padding: 5px 12px; }

          /* Messages */
          .msgs { padding: 16px 14px 6px; gap: 14px; }
          .mwrap { max-width: 85%; }
          .bubble { font-size: 13px; padding: 10px 14px; }
          .mav { width: 26px; height: 26px; font-size: 11px; margin-top: 16px; }
          .mav.ai { margin-right: 7px; }
          .mav.usr { margin-left: 7px; }

          /* Input area */
          .ia { padding: 10px 12px 14px; }
          .irow { border-radius: 12px; padding: 4px 6px 4px 12px; gap: 7px; }
          .mic { width:36px; height:36px; font-size:14px; }
          .ci { font-size: 14px; }

          /* Send button: icon only on very small screens */
          .sbtn { padding: 0 14px; height: 38px; }
          .sbtn-label { display: none; }
          .sbtn-ico { display: inline; font-size: 16px; }

          .ifooter { font-size: 9.5px; margin-top: 7px; }
        }

        /* Very small phones */
        @media (max-width: 380px) {
          .hero-name { font-size: 16px; }
          .badges { gap: 5px; }
          .badge { font-size: 10px; padding: 3px 9px; }
        }
      `}</style>

      <div className="cr">
        <div className="cs">

          {/* TOP BAR */}
          <div className="tb">
            <div className="tb-brand">
              <div className="tb-icon">🤖</div>
              <div>
                <div className="tb-name">Digital Praveen</div>
                <div className="tb-sub">AI Engineer · Voice Interview Agent</div>
              </div>
            </div>
            <button
              onClick={() => { window.speechSynthesis.cancel(); setVoiceEnabled((v) => !v); }}
              style={{ display:"flex", alignItems:"center", gap:"6px", padding:"5px 12px", background: voiceEnabled ? "rgba(99,102,241,.12)" : "rgba(239,68,68,.12)", border: voiceEnabled ? "1px solid rgba(99,102,241,.3)" : "1px solid rgba(239,68,68,.3)", borderRadius:"999px", color: voiceEnabled ? "#a5b4fc" : "#fca5a5", fontSize:"11px", fontWeight:600, cursor:"pointer", letterSpacing:".04em", whiteSpace:"nowrap", flexShrink:0 }}
            >
              {voiceEnabled ? "🔊 Voice On" : "🔇 Muted"}
            </button>
            <div className="tb-pill">
              <div className="tb-dot" />
              <span className="tb-online">Online</span>
            </div>
          </div>

          {/* HERO */}
          <div className="hero">
            <h1 className="hero-name">👋 Hi, I'm <span>Praveen Rathod</span></h1>
            <p className="hero-bio">
              B.Tech Student at IIT (ISM) Dhanbad — passionate about AI, Software Engineering &amp; startups.
            </p>
            <div className="badges">
              {badges.map((b) => (
                <div key={b.label} className={`badge ${b.color}`}>
                  <span>{b.icon}</span><span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CHIPS */}
          <div className="chips-bar">
            <span className="chips-lbl">Ask</span>
            {suggestedQuestions.map((q) => (
              <button key={q} className="chip" onClick={() => handleSend(q)}>{q}</button>
            ))}
          </div>

          {/* MESSAGES */}
          <div className="msgs">
            {messages.length === 0 && !loading && (
              <div className="empty">
                <div className="empty-ico">💬</div>
                <div className="empty-ttl">Start the conversation</div>
                <div className="empty-sub">Tap a question above or type your own to begin.</div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`mrow ${msg.role}`}>
                {msg.role === "assistant" && <div className="mav ai">🤖</div>}
                <div className="mwrap">
                  <div className="mlbl">{msg.role === "user" ? "You" : "Praveen AI"}</div>
                  <div className={`bubble ${msg.role === "user" ? "u" : "a"}`}>
                    {msg.content}
                  </div>
                </div>
                {msg.role === "user" && <div className="mav usr">👤</div>}
              </div>
            ))}

            {loading && (
              <div className="mrow assistant">
                <div className="mav ai">🤖</div>
                <div className="mwrap">
                  <div className="mlbl">Praveen AI</div>
                  <div className="bubble a tdots">
                    <div className="td" /><div className="td" /><div className="td" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="ia">
            <div className="irow">
              <button
                className={`mic${isListening ? " on" : ""}`}
                onClick={startVoiceInput}
                title={isListening ? "Listening…" : "Voice input"}
              >
                {isListening ? "🔴" : "🎤"}
              </button>

              <input
                ref={inputRef}
                className="ci"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(); }}
                placeholder="Ask me anything…"
                disabled={loading}
                autoComplete="off"
              />

              <button
                className="sbtn"
                onClick={() => handleSend()}
                disabled={loading || !question.trim()}
              >
                {loading ? (
                  <><span className="sbtn-label">Thinking</span><span className="sbtn-ico">⏳</span></>
                ) : (
                  <><span className="sbtn-label">Send</span><span className="sbtn-ico">↑</span></>
                )}
              </button>
            </div>
            <p className="ifooter">Powered by Groq · Browser Speech Synthesis · No external TTS</p>
          </div>

        </div>
      </div>
    </>
  );
}