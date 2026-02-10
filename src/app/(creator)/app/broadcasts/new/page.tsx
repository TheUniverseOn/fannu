import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCreatorByUserId } from "@/lib/queries/creators";
import { getDropsByCreatorId } from "@/lib/queries/drops";
import { getRecipientsCount } from "@/lib/queries/broadcasts";
import { NewBroadcastClient } from "./new-broadcast-client";

export default async function NewBroadcastPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const creator = await getCreatorByUserId(user.id);

  if (!creator) {
    redirect("/onboarding");
  }

  const [drops, vipCount] = await Promise.all([
    getDropsByCreatorId(creator.id),
    getRecipientsCount(creator.id, "ALL"),
  ]);

  return (
    <NewBroadcastClient
      creatorId={creator.id}
      drops={drops}
      vipCount={vipCount}
    />
  );
}
