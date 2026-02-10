import { notFound } from "next/navigation";
import { getDropById } from "@/lib/queries/drops";
import { getCreatorOrDemo } from "@/lib/auth";
import { DropDetailClient } from "./drop-detail-client";

interface DropDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DropDetailPage({ params }: DropDetailPageProps) {
  const { id } = await params;
  const creator = await getCreatorOrDemo();

  if (!creator) {
    notFound();
  }

  const drop = await getDropById(id);

  if (!drop || drop.creator_id !== creator.id) {
    notFound();
  }

  return <DropDetailClient drop={drop} />;
}
