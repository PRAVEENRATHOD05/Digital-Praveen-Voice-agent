"use client";

import { useState } from "react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async (text: string) => {
    try {
      setIsPlaying(true);
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      const audioBlob = new Blob([Buffer.from(data.audio, "base64")], {
        type: "audio/mpeg",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  return <div className="text-gray-400 text-sm">{isPlaying && "🔊 Playing..."}</div>;
}
