'use client';

import { useState, useEffect } from 'react';
import {
  Announcement,
  AnnouncementCategory,
  ANNOUNCEMENT_CATEGORY_LABELS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_PRIORITY_COLORS,
} from '@/types';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  createNotificationsForAllUsers,
  getAllUsersWithEmail,
} from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'notice' as AnnouncementCategory,
    priority: 'low' as 'low' | 'medium' | 'high',
    sendEmail: false,
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      category: 'notice',
      priority: 'low',
      sendEmail: false,
    });
    setIsModalOpen(true);
  }

  function openEditModal(announcement: Announcement) {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      sendEmail: false,
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          priority: formData.priority,
          sendEmail: formData.sendEmail,
        });
      } else {
        const announcementId = await createAnnouncement({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          priority: formData.priority,
          sendEmail: formData.sendEmail,
          createdBy: user.uid,
          createdByName: user.displayName || user.email || '관리자',
        });

        await createNotificationsForAllUsers({
          type: 'announcement',
          title: formData.title,
          message: formData.content.substring(0, 100) + (formData.content.length > 100 ? '...' : ''),
          link: `/announcements/${announcementId}`,
          isRead: false,
          relatedId: announcementId,
        });

        if (formData.sendEmail) {
          try {
            const users = await getAllUsersWithEmail();
            await fetch('/api/send-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'announcement',
                title: formData.title,
                content: formData.content,
                priority: formData.priority,
                recipients: users,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send email notifications:', emailError);
          }
        }
      }

      await loadAnnouncements();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(announcement: Announcement) {
    if (!confirm(`"${announcement.title}" 공지를 삭제하시겠습니까?`)) return;

    try {
      await deleteAnnouncement(announcement.id);
      await loadAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('삭제에 실패했습니다.');
    }
  }

  function formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">📢 공지사항 관리</h1>
        <Button onClick={openCreateModal}>+ 공지 작성</Button>
      </div>

      <div className="neo-card p-6">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">등록된 공지사항이 없습니다.</p>
            <p className="mt-2">위의 &quot;공지 작성&quot; 버튼을 눌러 새 공지를 작성하세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="neo-card p-4 hover:shadow-[6px_6px_0px_#000] transition-shadow cursor-pointer"
                onClick={() => openEditModal(announcement)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-bold border-2 border-black rounded ${ANNOUNCEMENT_PRIORITY_COLORS[announcement.priority]}`}>
                        {ANNOUNCEMENT_PRIORITY_LABELS[announcement.priority]}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 border-2 border-black rounded">
                        {ANNOUNCEMENT_CATEGORY_LABELS[announcement.category]}
                      </span>
                      {announcement.sendEmail && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 border-2 border-black rounded">
                          📧 이메일 발송
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>작성자: {announcement.createdByName}</span>
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(announcement);
                    }}
                    className="text-red-600 hover:text-red-800 font-bold text-xl shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnnouncement ? '공지사항 수정' : '새 공지사항 작성'}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2">제목 *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="공지사항 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">내용 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="공지사항 내용을 입력하세요"
              className="w-full p-3 border-3 border-black rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE135] min-h-[150px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">분류</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                options={Object.entries(ANNOUNCEMENT_CATEGORY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </div>
            <div>
              <label className="block font-bold mb-2">중요도</label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                options={Object.entries(ANNOUNCEMENT_PRIORITY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </div>
          </div>

          {!editingAnnouncement && (
            <div className="neo-card p-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="sendEmail" className="font-bold">
                  📧 모든 교직원에게 이메일 알림 발송
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2 ml-8">
                체크하면 등록된 모든 사용자에게 이메일이 발송됩니다.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? '저장중...' : editingAnnouncement ? '수정하기' : '공지 등록'}
            </Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
