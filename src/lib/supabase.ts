import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_URL);

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface SavedDataset {
  id: string;
  user_id: string;
  name: string;
  csv_content: string;
  row_count: number;
  col_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  dataset_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SavedChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

// DATASET HELPERS
export async function saveDatasetToSupabase(
  name: string,
  csvContent: string,
  rowCount: number,
  colCount: number,
): Promise<SavedDataset | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("datasets")
    .insert({
      user_id: userData.user.id,
      name,
      csv_content: csvContent,
      row_count: rowCount,
      col_count: colCount,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving dataset to Supabase:", error);
    return null;
  }
  return data as SavedDataset;
}

export async function fetchUserDatasets(): Promise<SavedDataset[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user datasets:", error);
    return [];
  }
  return (data as SavedDataset[]) || [];
}

export async function deleteUserDataset(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("datasets").delete().eq("id", id);
  if (error) {
    console.error("Error deleting dataset:", error);
    return false;
  }
  return true;
}

// CHAT SESSION & MESSAGE HELPERS
export async function getOrCreateChatSession(
  datasetId: string,
  title: string = "Data Exploration",
): Promise<ChatSession | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  // Check if session exists
  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("dataset_id", datasetId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0] as ChatSession;
  }

  // Create session
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      dataset_id: datasetId,
      user_id: userData.user.id,
      title,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
  return data as ChatSession;
}

export async function fetchSessionMessages(sessionId: string): Promise<SavedChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching session messages:", error);
    return [];
  }
  return (data as SavedChatMessage[]) || [];
}

export async function saveChatMessage(
  sessionId: string,
  role: "user" | "assistant" | "system",
  content: string,
): Promise<SavedChatMessage | null> {
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      user_id: userData.user.id,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving chat message:", error);
    return null;
  }
  return data as SavedChatMessage;
}
