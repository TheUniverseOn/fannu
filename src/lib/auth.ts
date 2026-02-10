import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type CurrentUser = {
  id: string;
  email?: string;
  phone?: string;
};

export type CurrentCreator = Tables<"creators">;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
  };
}

export async function getCurrentCreator(): Promise<CurrentCreator | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: creator, error } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !creator) {
    return null;
  }

  return creator as CurrentCreator;
}

export async function requireCreator(): Promise<CurrentCreator> {
  const creator = await getCurrentCreator();

  if (!creator) {
    throw new Error("Unauthorized: No creator profile found");
  }

  return creator;
}

// For development/demo: Get a demo creator if not authenticated
export async function getCreatorOrDemo(): Promise<CurrentCreator | null> {
  const creator = await getCurrentCreator();
  if (creator) return creator;

  // In development, return the first creator as demo
  if (process.env.NODE_ENV === "development") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("creators")
      .select("*")
      .eq("status", "ACTIVE")
      .limit(1)
      .single();

    return data as CurrentCreator | null;
  }

  return null;
}
