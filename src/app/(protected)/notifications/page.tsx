'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/firebase/firestore';
import type { UserNotification } from '@/types';
import { Button } from '@/components/ui/Button';

function formatTimeAgo(timestamp: any): string {
  if (!timestamp) {
    return '';
  }

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'announcement':
      return '📢';
    case 'reservation_made':
      return '✅';
    case 'reservation_cancelled':
      return '❌';
    case 'calendar_event':
      return '📅';
    default:
      return '🔔';
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    void loadNotifications(user.uid);
  }, [user?.uid]);

  async function loadNotifications(userId: string) {
    setLoading(true);
    try {
      const data = await getUserNotifications(userId, 200);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleNotificationClick(notification: UserNotification) {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }

  async function handleMarkAllAsRead() {
    if (!user?.uid) {
      return;
    }

    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      alert('모두 읽음 처리에 실패했습니다.');
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">🔔 전체 알림</h1>
        <Button
          variant="secondary"
          onClick={handleMarkAllAsRead}
          disabled={markingAll || notifications.length === 0}
        >
          {markingAll ? '처리 중...' : '모두 읽음'}
        </Button>
      </div>

      <div className="neo-card p-4">
        {loading ? (
          <div className="py-12 text-center font-bold text-gray-500">로딩중...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-xl font-bold">알림이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const content = (
                <div
                  className={`neo-card p-4 transition-colors ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-base truncate">{notification.title}</p>
                        {!notification.isRead && <span className="w-2 h-2 bg-[#FF6B6B] rounded-full" />}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );

              if (notification.link) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
