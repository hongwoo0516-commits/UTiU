import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Globe2, Pencil } from "lucide-react";
import { DeleteLearning } from "@/components/delete-learning";

type RecordView = { title: string; category: string; description: string; learnedAt: string; link: string; isPublic?: boolean };
export function LearningCard({ record, id, editable = false }: { record: RecordView; id: string; editable?: boolean }) {
  return <article className="learning-card">
    <div className="card-top"><span className={`tag tag-${["개발", "디자인", "협업", "기타"].indexOf(record.category)}`}>{record.category}</span><time dateTime={record.learnedAt}>{record.learnedAt.replaceAll("-", ".")}</time></div>
    <h3>{record.title}</h3><p className={`learning-description ${editable ? "clamped" : ""}`}>{record.description}</p>
    {record.link && <a href={record.link} target="_blank" rel="noopener noreferrer" className="resource-link">관련 자료 보기<ArrowUpRight size={15} /></a>}
    {editable && <div className="card-bottom"><span className="visibility">{record.isPublic ? <><Globe2 size={13} />공개</> : <><LockKeyhole size={13} />비공개</>}</span><div className="card-tools"><Link href={`/dashboard/${id}/edit`} className="text-button"><Pencil size={14} />수정</Link><DeleteLearning id={id} /></div></div>}
  </article>;
}
