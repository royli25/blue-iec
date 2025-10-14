import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/integrations/openai/client";

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Generate a title from the first user message
export function generateChatTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  const content = firstUserMessage.content;
  // Take first 50 chars or up to first newline
  const truncated = content.split('\n')[0].slice(0, 50);
  return truncated + (content.length > 50 ? '...' : '');
}

// Fetch all chat sessions for the current user
export async function fetchChatSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }

  return (data || []).map(session => ({
    ...session,
    messages: session.messages as ChatMessage[]
  }));
}

// Create a new chat session
export async function createChatSession(
  messages: ChatMessage[] = []
): Promise<ChatSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const title = messages.length > 0 ? generateChatTitle(messages) : 'New Chat';

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: user.id,
      title,
      messages: messages as any
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat session:', error);
    return null;
  }

  return {
    ...data,
    messages: data.messages as ChatMessage[]
  };
}

// Update an existing chat session
export async function updateChatSession(
  sessionId: string,
  messages: ChatMessage[]
): Promise<boolean> {
  const title = generateChatTitle(messages);

  const { error } = await supabase
    .from('chat_sessions')
    .update({
      messages: messages as any,
      title
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating chat session:', error);
    return false;
  }

  return true;
}

// Delete a chat session
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }

  return true;
}

