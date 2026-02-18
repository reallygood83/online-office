'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAnnouncementById } from '@/lib/firebase/firestore';
import type { Announcement } from '@/types';
import { Button } from '@/components/ui/Button';

function formatDate(timestamp: any): string {
  if (!timestamp) {
    return '';
  }
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnnouncementDetailPage() {
  const params = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) {
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const data = await getAnnouncementById(params.id);
        setAnnouncement(data);
      } catch (error) {
        console.error('Failed to load announcement:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold">로딩중...</div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black">📢 공지사항</h1>
        <div className="neo-card p-8 text-center">
          <p className="font-bold text-lg">존재하지 않는 공지입니다.</p>
          <Link href="/dashboard" className="inline-block mt-4">
            <Button>대시보드로 이동</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black">📢 공지사항</h1>
        <Link href="/dashboard">
          <Button variant="secondary">대시보드로</Button>
        </Link>
      </div>

      <div className="neo-card p-6 space-y-4">
        <h2 className="text-2xl font-black break-words">{announcement.title}</h2>
        <p className="text-sm text-gray-500">작성일: {formatDate(announcement.createdAt)}</p>
        <div className="border-t-2 border-dashed border-gray-300 pt-4">
          <p className="whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
        </div>
        <p className="text-xs text-gray-500">작성자: {announcement.createdByName}</p>
      </div>
    </div>
  );
}
