import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, ArrowUpRight, BookOpen, Globe2, LockKeyhole } from 'lucide-react'
import { getOwnLearnings, requireUser } from '@/lib/data'
import { LearningCard } from '@/components/learning-card'
import { CopyLink } from '@/components/copy-link'

export const metadata: Metadata = {
  title: '내 학습 기록',
  robots: { index: false, follow: false },
}
export default async function DashboardPage() {
  const user = await requireUser()
  const records = await getOwnLearnings(user.id)
  const publicCount = records.filter((r) => r.isPublic).length
  return (
    <div className="container dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow">MY LEARNING JOURNEY</p>
          <h1>기록 목록</h1>
        </div>
        <Link href="/dashboard/new" className="button primary">
          <Plus size={18} />새 기록 작성
        </Link>
      </div>
      <div className="stat-grid">
        {[
          { icon: BookOpen, label: '전체 기록', count: records.length },
          { icon: Globe2, label: '공개 기록', count: publicCount },
          {
            icon: LockKeyhole,
            label: '나만 보는 기록',
            count: records.length - publicCount,
          },
        ].map(({ icon: Icon, label, count }) => (
          <div className="stat-card" key={label}>
            <span>
              <Icon size={17} />
              {label}
            </span>
            <strong>
              {count}
              <small>개</small>
            </strong>
          </div>
        ))}
      </div>
      <section className="portfolio-panel">
        <div className="portfolio-panel-heading">
          <div>
            <h2>나의 포트폴리오</h2>
            {user.bio && <p>{user.bio}</p>}
          </div>
          <div className="portfolio-panel-actions">
            <Link href={`/portfolio/${user.id}`} className="button secondary">
              포트폴리오 보기
              <ArrowUpRight size={16} />
            </Link>
            <CopyLink path={`/portfolio/${user.id}`} />
          </div>
        </div>
      </section>
      <section className="class-project" aria-labelledby="class-project-title">
        <div>
          <h2 id="class-project-title">수업에서 만든 프로젝트</h2>
        </div>
        <div className="class-project-actions">
          <a
            href="https://github.com/hongwoo0516-commits/my-app"
            target="_blank"
            rel="noopener noreferrer"
            className="button secondary"
          >
            <BookOpen size={17} />GitHub 보기<ArrowUpRight size={16} />
          </a>
          <a
            href="https://my-app-beta-five-89.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="button primary"
          >
            <Globe2 size={17} />사이트 보기<ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      {records.length > 0 && (
        <section className="records-section">
          <div className="records-heading">
            <p>학습 날짜가 최근인 순서로 보여요.</p>
          </div>
          <div className="learning-grid">
            {records.map((record) => (
              <LearningCard
                key={String(record._id)}
                id={String(record._id)}
                record={record}
                editable
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
