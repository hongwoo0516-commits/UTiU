import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser, isRecordId } from "@/lib/data";
import { Learning } from "@/models/Learning";
import { RecordEditor } from "@/components/record-editor";
import type { LearningInput } from "@/lib/validation";

export const metadata: Metadata = { title: "학습 기록 수정", robots: { index: false, follow: false } };
export default async function EditLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!isRecordId(id)) notFound();
  const record = await Learning.findOne({ _id: id, userId: user.id }).lean();
  if (!record) notFound();
  return <RecordEditor id={id} initial={{ title: record.title, category: record.category as LearningInput["category"], description: record.description, learnedAt: record.learnedAt, isPublic: record.isPublic }} />;
}
