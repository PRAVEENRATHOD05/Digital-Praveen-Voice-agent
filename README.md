# Digital Praveen

An AI-powered voice chat application built with Next.js, featuring speech-to-text, LLM integration, and text-to-speech capabilities.

## Features

- 💬 Real-time chat with AI
- 🎤 Voice input using microphone
- 🔊 AI voice responses with ElevenLabs TTS
- 💾 Chat history saved to database
- 🎨 Clean, responsive UI with Tailwind CSS
- 🚀 Built with Next.js and TypeScript

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT / Google Gemini
- **TTS**: ElevenLabs API
- **Database**: Supabase
- **Speech Recognition**: Web Speech API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd digital-praveen
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create `.env.local` file with your API keys:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
digital-praveen/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main landing/chat page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/               # API routes
│       ├── chat/          # LLM responses
│       ├── tts/           # Text-to-speech
│       └── conversation/  # Chat history
├── components/            # React components
│   ├── Chat.tsx
│   ├── VoiceRecorder.tsx
│   ├── AudioPlayer.tsx
│   ├── MessageBubble.tsx
│   └── SuggestedQuestions.tsx
├── lib/                   # Utility functions
│   ├── openai.ts
│   ├── elevenlabs.ts
│   ├── supabase.ts
│   └── prompt.ts
├── types/                 # TypeScript interfaces
│   ├── chat.ts
│   └── database.ts
├── data/                  # Static data
│   ├── profile.json
│   └── sample-questions.json
├── public/                # Static assets
│   ├── avatar.png
│   ├── logo.svg
│   └── favicon.ico
└── Configuration files
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── .env.local
    ├── .gitignore
    └── README.md
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables

See `.env.local` for all required environment variables.

## License

MIT
