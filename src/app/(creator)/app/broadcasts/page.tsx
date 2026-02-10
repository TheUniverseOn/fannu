import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCreatorByUserId } from "@/lib/queries/creators";
import { getBroadcastsByCreatorId } from "@/lib/queries/broadcasts";
import { BroadcastsClient } from "./broadcasts-client";

export default async function BroadcastsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const creator = await getCreatorByUserId(user.id);

  if (!creator) {
    redirect("/onboarding");
  }

  const broadcasts = await getBroadcastsByCreatorId(creator.id);

  return <BroadcastsClient broadcasts={broadcasts} />;
}
