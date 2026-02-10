import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCreatorByUserId } from "@/lib/queries/creators";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const creator = await getCreatorByUserId(user.id);

  if (!creator) {
    redirect("/onboarding");
  }

  return <SettingsClient creator={creator} />;
}
