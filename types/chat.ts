export interface Message {
role: "user" | "assistant";
content: string;
}

export interface ChatMessage {
id: string;
text: string;
sender: "user" | "ai";
timestamp: Date;
audioUrl?: string;
}

export interface Conversation {
id: string;
userId: string;
messages: ChatMessage[];
createdAt: Date;
updatedAt: Date;
title?: string;
}

export interface ChatRequest {
message: string;
conversationId?: string;
userId?: string;
}

export interface ChatResponse {
response: string;
conversationId?: string;
}
