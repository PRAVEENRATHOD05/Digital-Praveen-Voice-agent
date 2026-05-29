"use client";

import questions from "@/data/sample-questions.json";

interface SuggestedQuestionsProps {
  onSelect?: (question: string) => void;
}

export default function SuggestedQuestions({
  onSelect,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-6">
        Quick Start
      </h2>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {questions.map((q, index) => (
          <button
            key={index}
            onClick={() => onSelect?.(q)}
            className="border rounded-lg p-3 hover:bg-gray-100"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}