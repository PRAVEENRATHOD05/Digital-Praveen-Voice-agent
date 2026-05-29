export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: "user" | "ai";
  audioUrl?: string;
  createdAt: Date;
}

export interface UserProfile {
  userId: string;
  name: string;
  avatar?: string;
  preferences?: {
    theme?: "light" | "dark";
    language?: string;
    voiceId?: string;
  };
}
