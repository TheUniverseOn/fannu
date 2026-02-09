import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Creator = Tables<"creators">;

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .single();

  if (error) {
    console.error("Error fetching creator:", error);
    return null;
  }

  return data;
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching creator:", error);
    return null;
  }

  return data;
}

export async function getCreatorByUserId(userId: string): Promise<Creator | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching creator:", error);
    return null;
  }

  return data;
}

export async function getAllCreators(): Promise<Creator[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching creators:", error);
    return [];
  }

  return data ?? [];
}
