'use client';

import { useState, useEffect, useMemo } from 'react';
import { SpecialRoom, RoomReservation, DayOfWeek, DAY_LABELS, ReservationPeriod } from '@/types';
import { 
  getSpecialRooms, 
  getAllWeekReservations, 
  createReservation, 
  deleteReservation 
} from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

const DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
const PERIODS: ReservationPeriod[] = [1, 2, 3, 4, 5, 6];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateKorean(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function ReservationPage() {
  const { user, firebaseUser } = useAuth();
  const [rooms, setRooms] = useState<SpecialRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [reservations, setReservations] = useState<RoomReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; period: ReservationPeriod } | null>(null);
  const [formData, setFormData] = useState({ className: '', purpose: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadReservations();
    }
  }, [selectedRoomId, weekStart]);

  async function loadRooms() {
    try {
      const data = await getSpecialRooms();
      setRooms(data);
      if (data.length > 0) {
        setSelectedRoomId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReservations() {
    try {
      const weekStartStr = formatDate(weekStart);
      const data = await getAllWeekReservations(weekStartStr);
      setReservations(data.filter(r => r.roomId === selectedRoomId));
    } catch (error) {
      console.error('Failed to load reservations:', error);
    }
  }

  const selectedRoom = useMemo(() => 
    rooms.find(r => r.id === selectedRoomId), 
    [rooms, selectedRoomId]
  );

  const weekDates = useMemo(() => {
    return DAYS.map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  function getReservation(day: DayOfWeek, period: ReservationPeriod): RoomReservation | undefined {
    return reservations.find(r => r.day === day && r.period === period);
  }

  function handlePrevWeek() {
    setWeekStart(prev => addDays(prev, -7));
  }

  function handleNextWeek() {
    setWeekStart(prev => addDays(prev, 7));
  }

  function handleToday() {
    setWeekStart(getMonday(new Date()));
  }

  function handleCellClick(day: DayOfWeek, period: ReservationPeriod) {
    const reservation = getReservation(day, period);
    
    if (reservation) {
      const canDelete = reservation.reservedBy === user?.uid || user?.isAdmin;
      if (canDelete) {
        handleDeleteReservation(reservation);
      }
      return;
    }

    setSelectedSlot({ day, period });
    setFormData({ className: '', purpose: '' });
    setIsModalOpen(true);
  }

  async function handleDeleteReservation(reservation: RoomReservation) {
    if (!confirm('이 예약을 취소하시겠습니까?')) return;
    
    try {
      await deleteReservation(reservation.id);
      await loadReservations();
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      alert('예약 취소에 실패했습니다.');
    }
  }

  async function handleSaveReservation() {
    const userId = firebaseUser?.uid || user?.uid;
    if (!userId || !selectedSlot) return;

    const reserverName =
      user?.displayName || user?.email || firebaseUser?.displayName || firebaseUser?.email || '알 수 없음';

    setSaving(true);
    try {
      await createReservation({
        roomId: selectedRoomId,
        weekStart: formatDate(weekStart),
        day: selectedSlot.day,
        period: selectedSlot.period,
        reservedBy: userId,
        reserverName,
        className: formData.className || undefined,
        purpose: formData.purpose || undefined,
      });
      await loadReservations();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create reservation:', error);
      alert('예약에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold">로딩중...</div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black">🏢 특별실 예약</h1>
        <div className="neo-card p-8 text-center">
          <p className="text-lg text-gray-600">등록된 특별실이 없습니다.</p>
          <p className="text-gray-500 mt-2">관리자에게 특별실 등록을 요청해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">🏢 특별실 예약</h1>

      <div className="neo-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`px-4 py-2 font-bold rounded-lg border-3 border-black transition-all ${
                  selectedRoomId === room.id
                    ? `${room.color} shadow-[4px_4px_0px_#000]`
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="secondary" onClick={handlePrevWeek}>
              ◀ 이전주
            </Button>
            <Button variant="secondary" onClick={handleToday}>
              이번주
            </Button>
            <Button variant="secondary" onClick={handleNextWeek}>
              다음주 ▶
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center font-bold text-lg">
          {formatDateKorean(weekStart)} ~ {formatDateKorean(addDays(weekStart, 4))}
        </div>
      </div>

      <div className="neo-card p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-3 border-black bg-gray-100 p-3 w-20">교시</th>
              {DAYS.map((day, i) => (
                <th key={day} className="border-3 border-black bg-gray-100 p-3 min-w-[120px]">
                  <div className="font-bold">{DAY_LABELS[day]}</div>
                  <div className="text-sm text-gray-600">{formatDateKorean(weekDates[i])}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period}>
                <td className="border-3 border-black bg-gray-50 p-3 text-center font-bold">
                  {period}교시
                </td>
                {DAYS.map((day) => {
                  const reservation = getReservation(day, period);
                  const isOwn = reservation?.reservedBy === user?.uid;
                  const canDelete = Boolean(reservation && (isOwn || user?.isAdmin));
                  
                  return (
                    <td
                      key={`${day}-${period}`}
                      onClick={() => handleCellClick(day, period)}
                      className={`border-3 border-black p-2 cursor-pointer transition-all ${
                        reservation
                          ? canDelete
                            ? `${selectedRoom?.color || 'bg-blue-300'} hover:opacity-80`
                            : 'bg-gray-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {reservation ? (
                        <div className="text-sm">
                          <div className="font-bold">{reservation.reserverName}</div>
                          {reservation.className && (
                            <div className="text-xs text-gray-700">{reservation.className}</div>
                          )}
                          {reservation.purpose && (
                            <div className="text-xs text-gray-600 truncate">{reservation.purpose}</div>
                          )}
                          {canDelete && (
                            <div className="text-xs text-red-600 mt-1">클릭하여 취소</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm text-center">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="neo-card p-4">
        <h3 className="font-bold mb-2">📌 사용 안내</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 빈 칸을 클릭하여 예약할 수 있습니다.</li>
          <li>• 작성자 본인 또는 관리자 계정은 예약 칸을 클릭해 취소할 수 있습니다.</li>
          <li>• 다른 사람의 예약(회색)은 취소할 수 없습니다.</li>
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="특별실 예약"
      >
        {selectedSlot && (
          <div className="space-y-4">
            <div className="neo-card p-4 bg-gray-50">
              <p><strong>특별실:</strong> {selectedRoom?.name}</p>
              <p><strong>일시:</strong> {DAY_LABELS[selectedSlot.day]}요일 {selectedSlot.period}교시</p>
              <p><strong>예약자:</strong> {user?.displayName || user?.email}</p>
            </div>

            <div>
              <label className="block font-bold mb-2">수업 학급 (선택)</label>
              <Input
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="예: 3-2, 5-1"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">사용 목적 (선택)</label>
              <Input
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="예: 과학 실험, 코딩 수업"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveReservation} disabled={saving} className="flex-1">
                {saving ? '예약중...' : '예약하기'}
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                취소
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
