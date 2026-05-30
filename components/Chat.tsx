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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          width: 100%; height: 100%;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
        }

        /* ── THEME TOKENS ── */
        .app {
          --bg:          #212121;
          --bg2:         #2f2f2f;
          --bg3:         #3a3a3a;
          --border:      #3f3f3f;
          --text1:       #ececec;
          --text2:       #b4b4b4;
          --text3:       #666;
          --user-pill:   #2f2f2f;
          --input-bg:    #2f2f2f;
          --input-ring:  rgba(255,255,255,.1);
          --send-bg:     #ffffff;
          --send-color:  #000000;
          --accent:      #6366f1;
        }
        .app.light {
          --bg:          #ffffff;
          --bg2:         #f4f4f4;
          --bg3:         #e8e8e8;
          --border:      #e0e0e0;
          --text1:       #0d0d0d;
          --text2:       #555;
          --text3:       #999;
          --user-pill:   #f4f4f4;
          --input-bg:    #f4f4f4;
          --input-ring:  rgba(0,0,0,.08);
          --send-bg:     #0d0d0d;
          --send-color:  #ffffff;
          --accent:      #6366f1;
        }

        /* ── SHELL ── */
        .app {
          width: 100vw; height: 100dvh; height: 100vh;
          display: flex; flex-direction: column;
          background: var(--bg);
          color: var(--text1);
          transition: background .2s, color .2s;
          position: relative;
        }

        /* ════════════════════
           TOPBAR
        ════════════════════ */
        .topbar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 52px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          z-index: 20;
        }

        .tb-left { display: flex; align-items: center; gap: 8px; }

        .brand-name {
          font-size: 16px; font-weight: 600;
          color: var(--text1); letter-spacing: -.01em;
        }

        .tb-right { display: flex; align-items: center; gap: 8px; }

        .tb-btn {
          height: 32px; padding: 0 12px; border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent; color: var(--text2);
          font-size: 11.5px; font-weight: 500; font-family: 'Inter', sans-serif;
          cursor: pointer; display: flex; align-items: center; gap: 5px;
          transition: all .15s; white-space: nowrap;
          letter-spacing: .01em;
        }
        .tb-btn:hover { background: var(--bg2); color: var(--text1); }

        .voice-on  { background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.3); color: #a5b4fc; }
        .voice-off { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.25); color: #fca5a5; }
        .voice-on:hover  { background: rgba(99,102,241,.18); }
        .voice-off:hover { background: rgba(239,68,68,.14); }

        /* ════════════════════
           EMPTY STATE
          (vertically centered, input in middle)
        ════════════════════ */
        .empty-screen {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 80px 24px 0;
          gap: 32px;
        }

        .empty-greeting {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 600; color: var(--text1);
          letter-spacing: -.02em; text-align: center;
        }

        .empty-input-wrap {
          width: 100%; max-width: 680px;
          display: flex; flex-direction: column; gap: 14px;
          align-items: center;
        }

        .chips-row {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
        }

        .chip {
          padding: 7px 16px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 999px;
          color: var(--text2); font-size: 13px;
          font-family: 'Inter', sans-serif;
          cursor: pointer; white-space: nowrap;
          transition: all .15s;
        }
        .chip:hover {
          background: var(--bg3); color: var(--text1);
          border-color: var(--accent);
        }

        /* ════════════════════
           CHAT SCREEN
        ════════════════════ */
        .chat-screen {
          flex: 1; display: flex; flex-direction: column;
          padding-top: 52px; /* topbar height */
          min-height: 0;
        }

        .msgs {
          flex: 1; overflow-y: auto;
          padding: 40px 0 24px;
          scroll-behavior: smooth;
        }
        .msgs::-webkit-scrollbar { width: 4px; }
        .msgs::-webkit-scrollbar-track { background: transparent; }
        .msgs::-webkit-scrollbar-thumb { background: var(--bg3); border-radius: 999px; }

        .msgs-inner {
          width: 100%; max-width: 720px;
          margin: 0 auto; padding: 0 24px;
          display: flex; flex-direction: column; gap: 28px;
        }

        /* USER message — pill aligned right, no avatar */
        .msg-user {
          display: flex; justify-content: flex-end;
          animation: fadein .2s ease;
        }
        .user-pill {
          background: var(--user-pill);
          color: var(--text1);
          border-radius: 18px;
          padding: 12px 18px;
          font-size: 15px; line-height: 1.6;
          max-width: 75%;
          word-break: break-word;
        }

        /* AI message — no bubble, plain text flush left */
        .msg-ai {
          display: flex; flex-direction: column; gap: 8px;
          animation: fadein .2s ease;
        }
        .ai-text {
          font-size: 15px; line-height: 1.75;
          color: var(--text1);
          word-break: break-word;
          max-width: 100%;
        }

        @keyframes fadein {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* thinking dots */
        .tdots { display: flex; align-items: center; gap: 5px; padding: 4px 0; }
        .td {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--text3);
          animation: tbounce 1.3s infinite ease-in-out;
        }
        .td:nth-child(2) { animation-delay: .2s; }
        .td:nth-child(3) { animation-delay: .4s; }
        @keyframes tbounce {
          0%,80%,100% { transform: scale(.65); opacity: .4; }
          40%         { transform: scale(1);   opacity: 1; }
        }

        /* ════════════════════
           INPUT BAR
           (shared by both states)
        ════════════════════ */
        .input-zone {
          width: 100%; max-width: 680px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* empty screen: no extra bottom padding */
        .empty-input-wrap .input-zone { padding: 0; }

        /* chat screen: pinned at bottom */
        .chat-input-wrap {
          padding: 12px 24px 20px;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
        }

        .ibar {
          width: 100%;
          display: flex; align-items: center; gap: 6px;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 8px 8px 8px 16px;
          transition: border-color .18s, box-shadow .18s;
        }
        .ibar:focus-within {
          border-color: rgba(255,255,255,.2);
          box-shadow: 0 0 0 4px var(--input-ring);
        }
        .app.light .ibar:focus-within {
          border-color: rgba(0,0,0,.15);
        }

        .ci {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text1); font-family: 'Inter', sans-serif;
          font-size: 15px; padding: 6px 4px;
          caret-color: var(--text1);
          resize: none;
        }
        .ci::placeholder { color: var(--text3); }

        /* mic button */
        .mic-btn {
          width: 36px; height: 36px; flex-shrink: 0;
          border-radius: 10px; border: none;
          background: transparent; color: var(--text2);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer; transition: all .15s;
        }
        .mic-btn:hover { background: var(--bg3); color: var(--text1); }
        .mic-btn.on    {
          color: #f87171;
          animation: micpulse 1s infinite;
        }
        @keyframes micpulse {
          0%,100% { opacity:1; }
          50%      { opacity:.5; }
        }

        /* send button */
        .send-btn {
          width: 36px; height: 36px; flex-shrink: 0;
          border-radius: 10px; border: none;
          background: var(--send-bg); color: var(--send-color);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer;
          transition: all .15s;
          box-shadow: none;
        }
        .send-btn:hover:not(:disabled) { opacity: .85; transform: scale(1.04); }
        .send-btn:disabled { opacity: .25; cursor: not-allowed; }

        .footer-note {
          font-size: 11.5px; color: var(--text3);
          text-align: center; letter-spacing: .01em;
        }

        /* ════════════════════
           RESPONSIVE
        ════════════════════ */
        @media (max-width: 767px) {
          .topbar { padding: 0 14px; }
          .brand-sub-txt { display: none; }
          .empty-greeting { font-size: 20px; }
          .msgs-inner { padding: 0 16px; gap: 20px; }
          .user-pill { font-size: 14px; padding: 10px 15px; }
          .ai-text { font-size: 14px; }
          .chat-input-wrap { padding: 10px 16px 16px; }
          .input-zone { max-width: 100%; }
          .chip { font-size: 12px; padding: 6px 13px; }
          .empty-greeting { padding-top: 0; }
        }
      `}</style>

      <div className={`app${isDark ? "" : " light"}`}>

        {/* ══ TOPBAR (always visible) ══ */}
        <div className="topbar">
          <div className="tb-left">
            <span className="brand-name">🤖 Digital Praveen</span>
          </div>
          <div className="tb-right">
            <button
              className={`tb-btn ${voiceEnabled ? "voice-on" : "voice-off"}`}
              onClick={() => { window.speechSynthesis.cancel(); setVoiceEnabled(v => !v); }}
            >
              {voiceEnabled ? "🔊 Voice" : "🔇 Muted"}
            </button>
            <button
              className="tb-btn"
              onClick={() => setIsDark(d => !d)}
              title="Toggle theme"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* ══ EMPTY STATE ══ */}
        {messages.length === 0 && !loading && (
          <div className="empty-screen">
            <div className="empty-greeting">
              How can I help, Recruiter? 👋
            </div>

            <div className="empty-input-wrap">
              {/* Input bar */}
              <div className="input-zone">
                <div className="ibar">
                  <input
                    ref={inputRef}
                    className="ci"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(); }}
                    placeholder="Ask anything…"
                    autoComplete="off"
                  />
                  <button
                    className={`mic-btn${isListening ? " on" : ""}`}
                    onClick={startVoiceInput}
                    title={isListening ? "Listening…" : "Voice input"}
                  >
                    {isListening ? "🔴" : "🎤"}
                  </button>
                  <button
                    className="send-btn"
                    onClick={() => handleSend()}
                    disabled={!question.trim()}
                  >
                    ↑
                  </button>
                </div>
              </div>

              {/* Suggested questions */}
              <div className="chips-row">
                {suggestedQuestions.map(q => (
                  <button key={q} className="chip" onClick={() => handleSend(q)}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ CHAT STATE ══ */}
        {(messages.length > 0 || loading) && (
          <div className="chat-screen">
            {/* Messages */}
            <div className="msgs">
              <div className="msgs-inner">
                {messages.map((msg, i) => (
                  msg.role === "user" ? (
                    <div key={i} className="msg-user">
                      <div className="user-pill">{msg.content}</div>
                    </div>
                  ) : (
                    <div key={i} className="msg-ai">
                      <div className="ai-text">{msg.content}</div>
                    </div>
                  )
                ))}

                {loading && (
                  <div className="msg-ai">
                    <div className="tdots">
                      <div className="td"/><div className="td"/><div className="td"/>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input pinned at bottom */}
            <div className="chat-input-wrap">
              <div className="input-zone">
                <div className="ibar">
                  <input
                    ref={inputRef}
                    className="ci"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) handleSend(); }}
                    placeholder="Ask anything…"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button
                    className={`mic-btn${isListening ? " on" : ""}`}
                    onClick={startVoiceInput}
                    title={isListening ? "Listening…" : "Voice input"}
                  >
                    {isListening ? "🔴" : "🎤"}
                  </button>
                  <button
                    className="send-btn"
                    onClick={() => handleSend()}
                    disabled={loading || !question.trim()}
                  >
                    {loading ? "…" : "↑"}
                  </button>
                </div>
              </div>
              <p className="footer-note">Powered by Groq · AI-generated responses</p>
            </div>
          </div>
        )}

      </div>
    </>
  );
}