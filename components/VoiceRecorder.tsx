"use client";

import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onSend: (text: string) => void;
}

export default function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (e) => {
        const audioBlob = e.data;
        // TODO: Send audio to speech-to-text API
        setTranscript("Transcribed text...");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onSend(transcript);
      setTranscript("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Type or say something..."
          className="flex-1 bg-slate-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isRecording ? "Stop" : "🎤"}
        </button>
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
