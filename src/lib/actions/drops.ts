"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

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

  const { data: insertedDrop, error } = await supabase
    .from("drops")
    .insert({
      ...data,
      slug,
      slots_remaining: data.total_slots ?? null,
    } as TablesInsert<"drops">)
    .select()
    .single();

  if (error || !insertedDrop) {
    console.error("Error creating drop:", error);
    return { error: error?.message || "Failed to create drop" };
  }

  revalidatePath("/app/drops");
  return { data: insertedDrop as Tables<"drops"> };
}

export async function updateDrop(id: string, data: TablesUpdate<"drops">) {
  const supabase = await createClient();

  const { data: updatedDrop, error } = await supabase
    .from("drops")
    .update(data as TablesUpdate<"drops">)
    .eq("id", id)
    .select()
    .single();

  if (error || !updatedDrop) {
    console.error("Error updating drop:", error);
    return { error: error?.message || "Failed to update drop" };
  }

  const drop = updatedDrop as Tables<"drops">;

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
