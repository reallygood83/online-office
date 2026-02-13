'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  getCrossSubjectData,
  saveCrossSubjectData,
  initializeCrossSubjectData,
  calculateSectionTotal,
  calculateGradeTotal,
  calculateItemGradeTotal,
  calculateGrandTotal,
} from '@/lib/firebase/curriculumService';
import type {
  CrossSubjectCurriculumData,
  SafetyEducationSection,
  Grade,
  GradeHours,
} from '@/types';
import {
  SAFETY_EDUCATION_SECTIONS,
  SECTION_ITEMS_CONFIG,
  OPTIONAL_EDUCATION_ITEMS,
  SECTION_COLORS,
} from '@/types';

type GradeBand = '1-2' | '3-4' | '5-6';

const GRADE_BANDS: { id: GradeBand; label: string; grades: [Grade, Grade] }[] = [
  { id: '1-2', label: '1-2학년', grades: [1, 2] },
  { id: '3-4', label: '3-4학년', grades: [3, 4] },
  { id: '5-6', label: '5-6학년', grades: [5, 6] },
];

export default function CrossSubjectCurriculumPage() {
  const { user } = useAuth();
  const [data, setData] = useState<CrossSubjectCurriculumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBand, setSelectedBand] = useState<GradeBand>('1-2');
  const [hasChanges, setHasChanges] = useState(false);

  const currentYear = new Date().getFullYear();
  const selectedGrades = GRADE_BANDS.find((b) => b.id === selectedBand)?.grades || [1, 2];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      let fetchedData = await getCrossSubjectData(currentYear);
      if (!fetchedData) {
        fetchedData = initializeCrossSubjectData(
          SAFETY_EDUCATION_SECTIONS,
          SECTION_ITEMS_CONFIG,
          OPTIONAL_EDUCATION_ITEMS
        );
      }
      setData(fetchedData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data || !user) return;
    setSaving(true);
    try {
      await saveCrossSubjectData(data, user.uid);
      setHasChanges(false);
      alert('저장되었습니다!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = useCallback(
    (sectionId: number, itemId: string, grade: Grade, field: keyof GradeHours, value: number) => {
      if (!data) return;

      setData((prev) => {
        if (!prev) return prev;
        const newData = JSON.parse(JSON.stringify(prev)) as CrossSubjectCurriculumData;
        const section = newData.sections.find((s) => s.id === sectionId);
        if (!section) return prev;
        const item = section.items.find((i) => i.id === itemId);
        if (!item) return prev;
        item.grades[grade][field] = value;
        return newData;
      });
      setHasChanges(true);
    },
    [data]
  );

  const handleOptionalChange = useCallback((itemId: string, checked: boolean) => {
    setData((prev) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev)) as CrossSubjectCurriculumData;
      const item = newData.optionalItems.find((i) => i.id === itemId);
      if (item) item.checked = checked;
      return newData;
    });
    setHasChanges(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold">로딩 중...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold text-red-500">데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  const grandTotal = calculateGrandTotal(data.sections);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">📋 범교과 시수 편성표</h1>
          <p className="text-gray-600 mt-1">{currentYear}학년도 기준 | 경기도교육청</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          variant={hasChanges ? 'primary' : 'secondary'}
        >
          {saving ? '저장 중...' : hasChanges ? '💾 변경사항 저장' : '✓ 저장됨'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="neo-card rounded-xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="text-sm text-white/90">학생안전교육 기준</div>
          <div className="text-3xl font-black text-white">51시간+</div>
        </div>
        <div className="neo-card rounded-xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="text-sm text-white/90">아동안전교육 기준</div>
          <div className="text-3xl font-black text-white">44시간+</div>
        </div>
        <div className="neo-card rounded-xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="text-sm text-white/90">현재 입력 총계</div>
          <div className="text-3xl font-black text-white">{grandTotal}시간</div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex border-b-3 border-[#1A1A2E]">
          {GRADE_BANDS.map((band) => (
            <button
              key={band.id}
              onClick={() => setSelectedBand(band.id)}
              className={`
                flex-1 px-6 py-4 font-bold text-lg transition-all
                ${selectedBand === band.id
                  ? 'bg-[#1A1A2E] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-[#1A1A2E]'
                }
              `}
            >
              {band.label}
            </button>
          ))}
        </div>

        <div className="p-4 bg-[#f8f9fa]">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#e74c3c] rounded"></span>
              <span>■ 아동안전교육 필수</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#fff9c4] border-2 border-[#1A1A2E] rounded"></span>
              <span>계</span>
            </div>
          </div>
        </div>
      </Card>

      {data.sections.map((section) => (
        <SectionTable
          key={section.id}
          section={section}
          grades={selectedGrades}
          onInputChange={handleInputChange}
        />
      ))}

      <GradeTotalsTable data={data} grades={selectedGrades} />

      <OptionalEducationSection
        items={data.optionalItems}
        onCheck={handleOptionalChange}
      />

      <Card className="bg-[#e8f4f8] border-l-4 border-[#3498db]">
        <div className="font-bold mb-2">📌 참고 사항</div>
        <ul className="text-sm space-y-1 text-[#2980b9]">
          <li>• ★ 학생안전교육 51시간 이상</li>
          <li>• ■ 아동안전교육 44시간 이상 | 아동복지법 제23조, 제31조 및 동법 시행령 제28조 제1항[별표6]</li>
          <li>• 관련 영역에 통합하여 시수 편성 가능 | 교과, 창의적 체험활동, 학교자율시간 등 교육과정과 연계하여 실시</li>
        </ul>
      </Card>
    </div>
  );
}

function SectionTable({
  section,
  grades,
  onInputChange,
}: {
  section: SafetyEducationSection;
  grades: [Grade, Grade];
  onInputChange: (sectionId: number, itemId: string, grade: Grade, field: keyof GradeHours, value: number) => void;
}) {
  const sectionTotal = calculateSectionTotal(section);
  const colorClass = SECTION_COLORS[section.color] || 'bg-[#3498db]';

  return (
    <Card className="p-0 overflow-hidden">
      <div className={`${colorClass} text-white px-4 py-3 flex justify-between items-center`}>
        <span className="font-bold">
          [{section.id}] {section.name} ({section.hoursDescription})
        </span>
        <span className="font-bold">{sectionTotal}시간</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={3} className="border-3 border-[#1A1A2E] px-3 py-2 min-w-[200px] text-left">
                세부 영역
              </th>
              <th rowSpan={3} className="border-3 border-[#1A1A2E] px-3 py-2 min-w-[180px] text-left">
                확보 시수
              </th>
              {grades.map((grade) => (
                <th
                  key={grade}
                  colSpan={5}
                  className="border-3 border-[#1A1A2E] px-3 py-2 bg-[#e3f2fd] text-[#1565c0] font-bold"
                >
                  {grade}학년
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50">
              {grades.map((grade) => (
                <Fragment key={grade}>
                  <th colSpan={2} className="border-2 border-[#1A1A2E] px-2 py-1 bg-[#fff3e0] text-xs">
                    1학기
                  </th>
                  <th colSpan={2} className="border-2 border-[#1A1A2E] px-2 py-1 bg-[#fff3e0] text-xs">
                    2학기
                  </th>
                  <th rowSpan={2} className="border-2 border-[#1A1A2E] px-2 py-1 bg-[#fff9c4] font-bold">
                    계
                  </th>
                </Fragment>
              ))}
            </tr>
            <tr className="bg-gray-50">
              {grades.map((grade) => (
                <Fragment key={grade}>
                  <th className="border-2 border-[#1A1A2E] px-1 py-1 text-xs font-normal">교과</th>
                  <th className="border-2 border-[#1A1A2E] px-1 py-1 text-xs font-normal">창체</th>
                  <th className="border-2 border-[#1A1A2E] px-1 py-1 text-xs font-normal">교과</th>
                  <th className="border-2 border-[#1A1A2E] px-1 py-1 text-xs font-normal">창체</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border-2 border-[#1A1A2E] px-3 py-2 bg-[#fafafa] font-medium">
                  {item.isRequired && <span className="text-[#e74c3c] font-bold mr-1">■</span>}
                  {item.name}
                </td>
                <td className="border-2 border-[#1A1A2E] px-3 py-2 text-xs text-gray-600">
                  {item.hoursInfo}
                </td>
                {grades.map((grade) => {
                  const gradeTotal = calculateItemGradeTotal(item, grade);
                  return (
                    <Fragment key={grade}>
                      <td className="border-2 border-[#1A1A2E] p-1">
                        <HoursInput
                          value={item.grades[grade].sem1_gyo}
                          onChange={(v) => onInputChange(section.id, item.id, grade, 'sem1_gyo', v)}
                        />
                      </td>
                      <td className="border-2 border-[#1A1A2E] p-1">
                        <HoursInput
                          value={item.grades[grade].sem1_chang}
                          onChange={(v) => onInputChange(section.id, item.id, grade, 'sem1_chang', v)}
                        />
                      </td>
                      <td className="border-2 border-[#1A1A2E] p-1">
                        <HoursInput
                          value={item.grades[grade].sem2_gyo}
                          onChange={(v) => onInputChange(section.id, item.id, grade, 'sem2_gyo', v)}
                        />
                      </td>
                      <td className="border-2 border-[#1A1A2E] p-1">
                        <HoursInput
                          value={item.grades[grade].sem2_chang}
                          onChange={(v) => onInputChange(section.id, item.id, grade, 'sem2_chang', v)}
                        />
                      </td>
                      <td className="border-2 border-[#1A1A2E] px-2 py-1 bg-[#fff9c4] font-bold text-center text-[#856404]">
                        {gradeTotal}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function HoursInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-12 px-1 py-1 text-center border-2 border-gray-300 rounded-lg font-bold
                 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/30 focus:outline-none
                 transition-all"
    />
  );
}

function GradeTotalsTable({
  data,
  grades,
}: {
  data: CrossSubjectCurriculumData;
  grades: [Grade, Grade];
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-[#e91e63] text-white px-4 py-3 font-bold">
        📊 7대 영역 학년별 총계 (연간 51시간 이상 / 아동안전교육 44시간 이상)
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border-3 border-[#1A1A2E] px-3 py-2">구분</th>
              {grades.map((grade) => (
                <th key={grade} colSpan={5} className="border-3 border-[#1A1A2E] px-3 py-2 bg-[#e3f2fd] text-[#1565c0] font-bold">
                  {grade}학년
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50">
              {grades.map((grade) => (
                <Fragment key={grade}>
                  <th className="border-2 border-[#1A1A2E] px-2 py-1 text-xs">1학기<br />교과</th>
                  <th className="border-2 border-[#1A1A2E] px-2 py-1 text-xs">1학기<br />창체</th>
                  <th className="border-2 border-[#1A1A2E] px-2 py-1 text-xs">2학기<br />교과</th>
                  <th className="border-2 border-[#1A1A2E] px-2 py-1 text-xs">2학기<br />창체</th>
                  <th className="border-2 border-[#1A1A2E] px-2 py-1 bg-[#fff9c4] font-bold">계</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#e8f5e9]">
              <td className="border-2 border-[#1A1A2E] px-3 py-2 font-bold">총계</td>
              {grades.map((grade) => {
                const totals = calculateGradeTotal(data.sections, grade);
                return (
                  <Fragment key={grade}>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 text-center font-bold text-[#2e7d32]">
                      {totals.sem1_gyo}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 text-center font-bold text-[#2e7d32]">
                      {totals.sem1_chang}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 text-center font-bold text-[#2e7d32]">
                      {totals.sem2_gyo}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 text-center font-bold text-[#2e7d32]">
                      {totals.sem2_chang}
                    </td>
                    <td className="border-2 border-[#1A1A2E] px-2 py-2 text-center font-bold bg-[#fff9c4] text-[#1565c0]">
                      {totals.total}
                    </td>
                  </Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function OptionalEducationSection({
  items,
  onCheck,
}: {
  items: CrossSubjectCurriculumData['optionalItems'];
  onCheck: (id: string, checked: boolean) => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-[#8e44ad] text-white px-4 py-3 font-bold">
        ☑ 의무·권장 교육 (학교 교육여건에 따라 편성)
      </div>
      <div className="p-4">
        <div className="grid md:grid-cols-2 gap-3">
          {items.map((item) => (
            <label
              key={item.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                ${item.type === 'mandatory'
                  ? 'border-[#e74c3c] bg-red-50 hover:bg-red-100'
                  : 'border-[#9b59b6] bg-purple-50 hover:bg-purple-100'
                }
              `}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => onCheck(item.id, e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-400"
              />
              <span className="flex-1 font-medium">{item.name}</span>
              <span
                className={`
                  px-2 py-1 rounded-lg text-xs font-bold
                  ${item.type === 'mandatory'
                    ? 'bg-[#e74c3c] text-white'
                    : 'bg-[#9b59b6] text-white'
                  }
                `}
              >
                {item.type === 'mandatory' ? '의무' : '권장'}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gray-100 rounded-xl text-sm text-gray-600">
          <strong>*교과, 창체, 학교자율시간 등과 연계</strong><br />
          ☑ 학교 교육여건에 적합한 범위에서 교육과정에 반영<br />
          ⇒ 각 학교에서 교육활동에 필요한 시수를 정하여 안내함
        </div>
      </div>
    </Card>
  );
}

import { Fragment } from 'react';
