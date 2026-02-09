"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export async function createDrop(
  data: Omit<TablesInsert<"drops">, "slug"> & { slug?: string }
) {
  const supabase = await createClient();

  const slug = data.slug || generateSlug(data.title);

  const { data: drop, error } = await supabase
    .from("drops")
    .insert({
      ...data,
      slug,
      slots_remaining: data.total_slots ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating drop:", error);
    return { error: error.message };
  }

  revalidatePath("/app/drops");
  return { data: drop };
}

export async function updateDrop(id: string, data: TablesUpdate<"drops">) {
  const supabase = await createClient();

  const { data: drop, error } = await supabase
    .from("drops")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating drop:", error);
    return { error: error.message };
  }

  revalidatePath("/app/drops");
  revalidatePath(`/app/drops/${id}`);
  revalidatePath(`/d/${drop.slug}`);
  return { data: drop };
}

export async function publishDrop(id: string) {
  return updateDrop(id, { status: "LIVE" });
}

export async function endDrop(id: string) {
  return updateDrop(id, { status: "ENDED" });
}

export async function deleteDrop(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("drops").delete().eq("id", id);

  if (error) {
    console.error("Error deleting drop:", error);
    return { error: error.message };
  }

  revalidatePath("/app/drops");
  return { success: true };
}
