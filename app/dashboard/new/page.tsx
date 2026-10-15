import type { Metadata } from "next";
import { requireUser } from "@/lib/data";
import { RecordEditor } from "@/components/record-editor";

export const metadata: Metadata = { title: "새 학습 기록", robots: { index: false, follow: false } };
export default async function NewLearningPage() { await requireUser(); return <RecordEditor />; }
