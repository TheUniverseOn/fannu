import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCreatorByUserId } from "@/lib/queries/creators";
import { getAllVipsByCreatorId, getVipStatsByCreatorId } from "@/lib/queries/vip";
import { AudienceClient } from "./audience-client";

export default async function AudiencePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const creator = await getCreatorByUserId(user.id);

  if (!creator) {
    redirect("/onboarding");
  }

  const [subscribers, stats] = await Promise.all([
    getAllVipsByCreatorId(creator.id),
    getVipStatsByCreatorId(creator.id),
  ]);

  return <AudienceClient subscribers={subscribers} stats={stats} />;
}
