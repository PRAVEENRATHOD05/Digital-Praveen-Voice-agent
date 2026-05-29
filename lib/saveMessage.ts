import { supabase } from "./supabase";

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  const { error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        role,
        content,
      },
    ]);

  if (error) {
    console.error("Supabase Error:", error);
  }
}