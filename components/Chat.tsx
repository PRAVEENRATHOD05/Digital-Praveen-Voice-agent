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

  const [isDark, setIsDark] = useState(true);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── TOKENS ── */
        .app.dark {
          --bg:           #0d1117;
          --bg-panel:     #161b22;
          --bg-card:      #21262d;
          --bg-hover:     #30363d;
          --border:       #30363d;
          --border-focus: #6366f1;
          --text-1:       #e6edf3;
          --text-2:       #8b949e;
          --text-3:       #484f58;
          --accent:       #6366f1;
          --accent-2:     #38bdf8;
          --green:        #3fb950;
          --user-bubble:  #6366f1;
          --ai-bubble:    #21262d;
          --ai-border:    #30363d;
          --input-bg:     #0d1117;
          --shadow:       0 8px 32px rgba(0,0,0,.5);
        }
        .app.light {
          --bg:           #f6f8fa;
          --bg-panel:     #ffffff;
          --bg-card:      #f0f2f5;
          --bg-hover:     #e8eaed;
          --border:       #d0d7de;
          --border-focus: #6366f1;
          --text-1:       #1f2328;
          --text-2:       #656d76;
          --text-3:       #adb5bd;
          --accent:       #6366f1;
          --accent-2:     #0284c7;
          --green:        #1a7f37;
          --user-bubble:  #6366f1;
          --ai-bubble:    #f0f2f5;
          --ai-border:    #d0d7de;
          --input-bg:     #ffffff;
          --shadow:       0 4px 16px rgba(0,0,0,.08);
        }

        html, body {
          height: 100%; width: 100%;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }

        /* ── APP SHELL ── */
        .app {
          width: 100vw; height: 100dvh; height: 100vh;
          display: flex; flex-direction: column;
          background: var(--bg);
          color: var(--text-1);
          transition: background .2s, color .2s;
        }

        /* ════════════════════════════
           TOPBAR
        ════════════════════════════ */
        .topbar {
          height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px;
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          gap: 16px;
          position: relative;
          z-index: 10;
        }

        .topbar-left { display: flex; align-items: center; gap: 10px; }

        .brand-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #6366f1, #38bdf8);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 16px rgba(99,102,241,.4);
        }

        .brand-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px; font-weight: 700;
          color: var(--text-1); letter-spacing: -.02em;
        }

        .brand-sub {
          font-size: 11px; color: var(--text-2);
          letter-spacing: .04em; text-transform: uppercase;
          margin-left: 4px; margin-top: 1px;
        }

        .topbar-right { display: flex; align-items: center; gap: 8px; }

        /* status pill */
        .status-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          background: rgba(63,185,80,.1);
          border: 1px solid rgba(63,185,80,.25);
          border-radius: 999px;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--green);
          animation: pdot 2s infinite;
        }
        @keyframes pdot {
          0%,100% { box-shadow: 0 0 0 0 rgba(63,185,80,.4); }
          50%      { box-shadow: 0 0 0 4px rgba(63,185,80,0); }
        }
        .status-txt { font-size: 11px; font-weight: 600; color: var(--green); letter-spacing: .05em; text-transform: uppercase; }

        /* icon button base */
        .icon-btn {
          height: 34px; padding: 0 12px; border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-2);
          font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all .15s; white-space: nowrap; flex-shrink: 0;
          letter-spacing: .01em;
        }
        .icon-btn:hover { background: var(--bg-hover); color: var(--text-1); border-color: var(--border-focus); }

        .voice-btn-on  { background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.35); color: #a5b4fc; }
        .voice-btn-off { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.3);   color: #fca5a5; }
        .voice-btn-on:hover  { background: rgba(99,102,241,.18); }
        .voice-btn-off:hover { background: rgba(239,68,68,.15); }

        /* theme toggle */
        .theme-btn { font-size: 15px; padding: 0 10px; }

        /* ════════════════════════════
           HERO STRIP  (compact)
        ════════════════════════════ */
        .hero-strip {
          padding: 12px 28px;
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 20px;
          flex-shrink: 0; flex-wrap: wrap;
        }

        .hero-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

        .hero-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px; font-weight: 700;
          color: var(--text-1); letter-spacing: -.02em; white-space: nowrap;
        }
        .hero-name span {
          background: linear-gradient(90deg, #38bdf8, #6366f1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-tagline { font-size: 11.5px; color: var(--text-2); white-space: nowrap; }

        .badges { display: flex; flex-wrap: wrap; gap: 6px; }

        .badge {
          display: flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 500; border: 1px solid;
          white-space: nowrap; transition: transform .12s;
          cursor: default;
        }
        .badge:hover { transform: translateY(-1px); }
        .badge-blue    { background:rgba(59,130,246,.1);  color:#93c5fd; border-color:rgba(59,130,246,.25); }
        .badge-violet  { background:rgba(139,92,246,.1);  color:#c4b5fd; border-color:rgba(139,92,246,.25); }
        .badge-emerald { background:rgba(16,185,129,.1);  color:#6ee7b7; border-color:rgba(16,185,129,.25); }
        .badge-amber   { background:rgba(245,158,11,.1);  color:#fcd34d; border-color:rgba(245,158,11,.25); }
        .badge-rose    { background:rgba(244,63,94,.1);   color:#fda4af; border-color:rgba(244,63,94,.25); }

        /* Light mode badge adjustments */
        .app.light .badge-blue    { background:rgba(59,130,246,.08);  color:#2563eb; }
        .app.light .badge-violet  { background:rgba(139,92,246,.08);  color:#7c3aed; }
        .app.light .badge-emerald { background:rgba(16,185,129,.08);  color:#059669; }
        .app.light .badge-amber   { background:rgba(245,158,11,.08);  color:#d97706; }
        .app.light .badge-rose    { background:rgba(244,63,94,.08);   color:#e11d48; }

        /* ════════════════════════════
           CHIPS BAR
        ════════════════════════════ */
        .chips-bar {
          padding: 8px 28px;
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 7px;
          flex-shrink: 0;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
        }
        .chips-bar::-webkit-scrollbar { display: none; }

        .chips-lbl {
          font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
          color: var(--text-3); font-weight: 600; flex-shrink: 0;
          margin-right: 2px;
        }

        .chip {
          padding: 4px 13px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 999px;
          color: var(--text-2);
          font-size: 12px; font-family: 'Inter', sans-serif;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: all .15s;
        }
        .chip:hover {
          background: rgba(99,102,241,.12);
          border-color: rgba(99,102,241,.4);
          color: var(--text-1);
          transform: translateY(-1px);
        }
        .chip:active { transform: none; }

        /* ════════════════════════════
           MESSAGES AREA  (flex-1 = fills everything)
        ════════════════════════════ */
        .msgs {
          flex: 1; overflow-y: auto;
          padding: 32px 0 16px;
          display: flex; flex-direction: column;
          scroll-behavior: smooth;
        }
        .msgs::-webkit-scrollbar { width: 4px; }
        .msgs::-webkit-scrollbar-track { background: transparent; }
        .msgs::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

        /* inner width constraint — ChatGPT-style centered column */
        .msgs-inner {
          width: 100%; max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex; flex-direction: column; gap: 24px;
        }

        /* empty state */
        .empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; text-align: center; padding: 60px 24px;
          color: var(--text-3);
        }
        .empty-ico { font-size: 40px; opacity: .3; }
        .empty-ttl { font-size: 16px; color: var(--text-2); font-weight: 500; }
        .empty-sub { font-size: 13px; color: var(--text-3); max-width: 320px; line-height: 1.6; }

        /* message row */
        .mrow {
          display: flex; gap: 12px;
          animation: mslide .22s ease forwards;
        }
        .mrow.user      { flex-direction: row-reverse; }
        .mrow.assistant { flex-direction: row; }

        @keyframes mslide {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* avatar */
        .mav {
          width: 30px; height: 30px; flex-shrink: 0;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 13px; margin-top: 2px;
        }
        .mav.ai  { background: linear-gradient(135deg,#6366f1,#38bdf8); box-shadow: 0 0 12px rgba(99,102,241,.3); }
        .mav.usr { background: var(--bg-card); border: 1px solid var(--border); }

        /* bubble wrapper */
        .mwrap { display: flex; flex-direction: column; gap: 4px; max-width: 75%; }
        .mrow.user .mwrap { align-items: flex-end; }

        .mlbl {
          font-size: 10px; font-weight: 600; letter-spacing: .06em;
          text-transform: uppercase; color: var(--text-3);
          padding: 0 4px;
        }

        .bubble {
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px; line-height: 1.7;
          word-break: break-word;
        }
        .bubble.u {
          background: var(--user-bubble);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 12px rgba(99,102,241,.3);
        }
        .bubble.a {
          background: var(--ai-bubble);
          color: var(--text-1);
          border: 1px solid var(--ai-border);
          border-bottom-left-radius: 4px;
        }

        /* thinking dots */
        .tdots { display:flex; align-items:center; gap:5px; padding:14px 16px; }
        .td {
          width:7px; height:7px; border-radius:50%;
          animation: tbounce 1.3s infinite ease-in-out;
        }
        .td:nth-child(1){ background:#38bdf8; }
        .td:nth-child(2){ background:#6366f1; animation-delay:.2s; }
        .td:nth-child(3){ background:#8b5cf6; animation-delay:.4s; }
        @keyframes tbounce {
          0%,80%,100%{ transform:scale(.65); opacity:.5; }
          40%        { transform:scale(1.15); opacity:1; }
        }

        /* ════════════════════════════
           INPUT AREA
        ════════════════════════════ */
        .ia {
          padding: 16px 24px 20px;
          background: var(--bg-panel);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        /* same width constraint as messages */
        .ia-inner {
          width: 100%; max-width: 860px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 10px;
        }

        .irow {
          display: flex; align-items: center; gap: 8px;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 6px 8px 6px 16px;
          transition: border-color .18s, box-shadow .18s;
        }
        .irow:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }

        .mic {
          width: 36px; height: 36px; flex-shrink: 0;
          border-radius: 8px; border: 1px solid var(--border);
          background: transparent; color: var(--text-2);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; cursor: pointer; transition: all .15s;
        }
        .mic:hover { background: var(--bg-hover); border-color: var(--border-focus); color: var(--text-1); }
        .mic.on    { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.4); color: #fca5a5; animation: mpulse 1s infinite; }
        @keyframes mpulse {
          0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,.35); }
          50%    { box-shadow:0 0 0 6px rgba(239,68,68,0); }
        }

        .ci {
          flex:1; background: transparent; border: none; outline: none;
          color: var(--text-1); font-family: 'Inter', sans-serif;
          font-size: 14px; padding: 8px 4px;
          caret-color: #6366f1;
        }
        .ci::placeholder { color: var(--text-3); }

        .sbtn {
          height: 38px; padding: 0 18px; border-radius: 9px;
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          border: none; color: #fff;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          flex-shrink: 0; letter-spacing: .01em;
          box-shadow: 0 1px 8px rgba(99,102,241,.35);
          transition: all .15s; white-space: nowrap;
        }
        .sbtn:hover:not(:disabled) { background:linear-gradient(135deg,#4338ca,#4f46e5); box-shadow:0 4px 16px rgba(99,102,241,.45); transform:translateY(-1px); }
        .sbtn:active:not(:disabled){ transform:none; }
        .sbtn:disabled { opacity:.4; cursor:not-allowed; }

        .sbtn-label { display:inline; }
        .sbtn-ico   { display:none; }

        .ifooter {
          text-align: center; font-size: 11px;
          color: var(--text-3); letter-spacing: .02em;
        }

        /* ════════════════════════════
           RESPONSIVE
        ════════════════════════════ */
        @media (max-width: 767px) {
          .topbar { padding: 0 16px; height: 50px; }
          .brand-sub { display:none; }
          .status-txt { display:none; }

          .hero-strip { padding: 10px 16px; gap: 10px; }
          .hero-tagline { display:none; }
          .badges { gap:5px; }
          .badge { font-size:10.5px; padding:3px 9px; }

          .chips-bar { padding: 7px 16px; }
          .chips-lbl { display:none; }
          .chip { font-size:11.5px; padding:4px 11px; }

          .msgs { padding: 20px 0 12px; }
          .msgs-inner { padding: 0 14px; gap:18px; }
          .mwrap { max-width:88%; }
          .bubble { font-size:13.5px; padding:10px 14px; }
          .mav { width:26px; height:26px; font-size:12px; }

          .ia { padding: 10px 14px 16px; }
          .ia-inner { gap:8px; }
          .sbtn { padding:0 14px; }
          .sbtn-label { display:none; }
          .sbtn-ico   { display:inline; font-size:16px; }
          .ifooter { font-size:10px; }
        }

        @media (max-width: 380px) {
          .hero-name { font-size:14px; }
          .badge { font-size:10px; padding:2px 8px; }
        }
      `}</style>

      <div className={`app ${isDark ? "dark" : "light"}`}>

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="topbar-left">
            <div className="brand-icon">🤖</div>
            <div>
              <div className="brand-name">Digital Praveen</div>
            </div>
            <span className="brand-sub">AI Engineer · Voice Interview Agent</span>
          </div>

          <div className="topbar-right">
            {/* Voice toggle */}
            <button
              className={`icon-btn ${voiceEnabled ? "voice-btn-on" : "voice-btn-off"}`}
              onClick={() => { window.speechSynthesis.cancel(); setVoiceEnabled((v) => !v); }}
            >
              {voiceEnabled ? "🔊" : "🔇"}
              <span>{voiceEnabled ? "Voice On" : "Muted"}</span>
            </button>

            {/* Theme toggle */}
            <button
              className="icon-btn theme-btn"
              onClick={() => setIsDark((d) => !d)}
              title={isDark ? "Switch to Light" : "Switch to Dark"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Online status */}
            <div className="status-pill">
              <div className="status-dot" />
              <span className="status-txt">Online</span>
            </div>
          </div>
        </div>

        {/* ── HERO STRIP ── */}
        <div className="hero-strip">
          <div className="hero-info">
            <div className="hero-name">👋 Hi, I'm <span>Praveen Rathod</span></div>
            <div className="hero-tagline">B.Tech · IIT (ISM) Dhanbad · AI &amp; Software Engineering</div>
          </div>
          <div className="badges">
            {badges.map((b) => (
              <div key={b.label} className={`badge ${b.color}`}>
                <span>{b.icon}</span><span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHIPS ── */}
        <div className="chips-bar">
          <span className="chips-lbl">Ask</span>
          {suggestedQuestions.map((q) => (
            <button key={q} className="chip" onClick={() => handleSend(q)}>{q}</button>
          ))}
        </div>

        {/* ── MESSAGES ── */}
        <div className="msgs">
          <div className="msgs-inner">
            {messages.length === 0 && !loading && (
              <div className="empty">
                <div className="empty-ico">💬</div>
                <div className="empty-ttl">Start the conversation</div>
                <div className="empty-sub">Click a suggested question above, or type your own below.</div>
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
        </div>

        {/* ── INPUT ── */}
        <div className="ia">
          <div className="ia-inner">
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
                placeholder="Ask me about my projects, experience, or background…"
                disabled={loading}
                autoComplete="off"
              />

              <button
                className="sbtn"
                onClick={() => handleSend()}
                disabled={loading || !question.trim()}
              >
                {loading
                  ? <><span className="sbtn-label">Thinking…</span><span className="sbtn-ico">⏳</span></>
                  : <><span className="sbtn-label">Send</span><span className="sbtn-ico">↑</span></>
                }
              </button>
            </div>
            <p className="ifooter">Powered by Groq · Browser Speech · Responses are AI-generated</p>
          </div>
        </div>

      </div>
    </>
  );
}