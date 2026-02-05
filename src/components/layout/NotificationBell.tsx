'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { UserNotification } from '@/types';
import { 
  getUserNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/firebase/firestore';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadUnreadCount() {
    try {
      const count = await getUnreadNotificationCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await getUserNotifications(userId, 10);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    if (!isOpen) {
      await loadNotifications();
    }
    setIsOpen(!isOpen);
  }

  async function handleNotificationClick(notification: UserNotification) {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }
    setIsOpen(false);
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead(userId);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  function formatTimeAgo(timestamp: any): string {
    if (!timestamp) return '';
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
      case 'announcement': return '📢';
      case 'reservation_made': return '✅';
      case 'reservation_cancelled': return '❌';
      case 'calendar_event': return '📅';
      default: return '🔔';
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF6B6B] border-2 border-black rounded-full flex items-center justify-center text-white text-xs font-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[400px] bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_#000] overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-[#FFE135] border-b-4 border-black">
            <h3 className="font-black">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold hover:underline"
              >
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">로딩중...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-4xl block mb-2">🔕</span>
                <p className="font-bold">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || '#'}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`p-3 border-b-2 border-gray-200 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${!notification.isRead ? 'text-black' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-[#FF6B6B] rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link href="/notifications">
            <div className="p-3 text-center border-t-2 border-gray-200 hover:bg-gray-50 transition-colors">
              <span className="text-sm font-bold text-gray-600">전체 알림 보기 →</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
