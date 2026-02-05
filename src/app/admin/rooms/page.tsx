'use client';

import { useState, useEffect } from 'react';
import { SpecialRoom, ROOM_COLORS } from '@/types';
import { getSpecialRooms, addSpecialRoom, updateSpecialRoom, deleteSpecialRoom } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<SpecialRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<SpecialRoom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: ROOM_COLORS[0] as string,
    order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      const data = await getSpecialRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingRoom(null);
    setFormData({
      name: '',
      description: '',
      color: ROOM_COLORS[0],
      order: rooms.length + 1,
    });
    setIsModalOpen(true);
  }

  function openEditModal(room: SpecialRoom) {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      color: room.color || ROOM_COLORS[0],
      order: room.order ?? 0,
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      alert('특별실 이름을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      if (editingRoom) {
        await updateSpecialRoom(editingRoom.id, {
          name: formData.name,
          description: formData.description || undefined,
          color: formData.color,
          order: formData.order,
        });
      } else {
        await addSpecialRoom({
          name: formData.name,
          description: formData.description || undefined,
          color: formData.color,
          order: formData.order,
        });
      }
      await loadRooms();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save room:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(room: SpecialRoom) {
    if (!confirm(`"${room.name}"을(를) 삭제하시겠습니까?\n이 특별실의 모든 예약도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      await deleteSpecialRoom(room.id);
      await loadRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert('삭제에 실패했습니다.');
    }
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
        <h1 className="text-3xl font-black">🏢 특별실 관리</h1>
        <Button onClick={openAddModal}>+ 특별실 추가</Button>
      </div>

      <div className="neo-card p-6">
        <p className="text-gray-600 mb-4">
          특별실을 등록하면 교사들이 예약할 수 있습니다.
        </p>

        {rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">등록된 특별실이 없습니다.</p>
            <p className="mt-2">위의 &quot;특별실 추가&quot; 버튼을 눌러 추가해주세요.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`neo-card p-4 ${room.color} cursor-pointer hover:shadow-[6px_6px_0px_#000] transition-shadow`}
                onClick={() => openEditModal(room)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{room.name}</h3>
                    {room.description && (
                      <p className="text-sm text-gray-700 mt-1">{room.description}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">순서: {room.order}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(room);
                    }}
                    className="text-red-600 hover:text-red-800 font-bold text-xl"
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
        title={editingRoom ? '특별실 수정' : '특별실 추가'}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-2">특별실 이름 *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 과학실, 컴퓨터실1"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">설명 (선택)</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="예: 본관 3층"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">색상</label>
            <div className="flex flex-wrap gap-2">
              {ROOM_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg border-3 border-black ${color} ${
                    formData.color === color ? 'ring-4 ring-black ring-offset-2' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">표시 순서</label>
            <Input
              type="number"
              min={1}
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? '저장중...' : '저장'}
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
