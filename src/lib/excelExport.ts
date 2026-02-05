import * as XLSX from 'xlsx';
import { TeacherScheduleData, ClassScheduleData, TEACHERS, TEACHER_INFO, ALL_CLASSES } from '@/data/scheduleData';
import { DayOfWeek, GRADE_CLASS_CONFIG } from '@/types';

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
};

/**
 * 전담교사 시간표를 엑셀로 다운로드 (9명 시간표를 하나의 시트에)
 */
export const downloadTeacherSchedulesExcel = (
  teacherSchedules: Record<string, TeacherScheduleData>,
  semester: 1 | 2
) => {
  const wb = XLSX.utils.book_new();
  
  // 모든 교사의 시간표 데이터를 하나의 2D 배열로 구성
  const wsData: any[][] = [];
  
  // 헤더 추가
  wsData.push(['박달초등학교 전담교사 시간표', '', '', '', '', '', '', '', '', '', '', '', '']);
  wsData.push([`${semester}학기`, '', '', '', '', '', '', '', '', '', '', '', '']);
  wsData.push(['']);
  
  TEACHERS.forEach((teacherId: string, index: number) => {
    const schedule = teacherSchedules[teacherId];
    const teacherInfo = TEACHER_INFO[teacherId];
    
    // 교사 정보 헤더
    wsData.push([`${teacherId} (${teacherInfo?.subject || ''}) - 주 ${teacherInfo?.weeklyHours || 0}시간`]);
    
    // 요일 헤더
    const headerRow = ['교시', '월', '화', '수', '목', '금'];
    wsData.push(headerRow);
    
    // 1-6교시 데이터
    for (let period = 0; period < 6; period++) {
      const row: any[] = [`${period + 1}교시`];
      
      (['mon', 'tue', 'wed', 'thu', 'fri'] as DayOfWeek[]).forEach((day) => {
        const cell = schedule?.[day]?.[period];
        if (cell) {
          if (typeof cell === 'string') {
            row.push(cell);
          } else {
            row.push(`${cell.className}(${cell.subject})`);
          }
        } else {
          row.push('');
        }
      });
      
      wsData.push(row);
    }
    
    // 교사 간 구분을 위한 빈 행
    wsData.push(['']);
    wsData.push(['']);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // 열 너비 설정
  ws['!cols'] = [
    { wch: 8 },   // 교시
    { wch: 12 },  // 월
    { wch: 12 },  // 화
    { wch: 12 },  // 수
    { wch: 12 },  // 목
    { wch: 12 },  // 금
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, '전담교사 시간표');
  XLSX.writeFile(wb, `전담교사_시간표_${semester}학기.xlsx`);
};

/**
 * 학급별 시간표를 학년별 시트로 다운로드
 */
export const downloadClassSchedulesExcel = (
  classSchedules: Record<string, ClassScheduleData>,
  semester: 1 | 2
) => {
  const wb = XLSX.utils.book_new();
  
  // 학년별로 반복 (1-6학년)
  for (let grade = 1; grade <= 6; grade++) {
    const classCount = GRADE_CLASS_CONFIG[grade as keyof typeof GRADE_CLASS_CONFIG];
    const wsData: any[][] = [];
    
    // 해당 학년의 반들
    const gradeClasses: string[] = [];
    for (let i = 1; i <= classCount; i++) {
      gradeClasses.push(`${grade}-${i}`);
    }
    
    // 헤더
    wsData.push([`${grade}학년 시간표`, '', '', '', '', '', '']);
    wsData.push([`${semester}학기`, '', '', '', '', '', '']);
    wsData.push(['']);
    
    // 각 반별 시간표
    gradeClasses.forEach((classId) => {
      const schedule = classSchedules[classId];
      
      wsData.push([`${classId}반`]);
      
      // 요일 헤더
      const headerRow = ['교시', '월', '화', '수', '목', '금'];
      wsData.push(headerRow);
      
      // 1-6교시 데이터
      for (let period = 0; period < 6; period++) {
        const row: any[] = [`${period + 1}교시`];
        
        (['mon', 'tue', 'wed', 'thu', 'fri'] as DayOfWeek[]).forEach((day) => {
          const cell = schedule?.[day]?.[period];
          if (cell) {
            row.push(`${cell.subject}\n${cell.teacher || ''}`);
          } else {
            row.push('');
          }
        });
        
        wsData.push(row);
      }
      
      // 반 간 구분
      wsData.push(['']);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 열 너비 설정
    ws['!cols'] = [
      { wch: 8 },   // 교시
      { wch: 15 },  // 월
      { wch: 15 },  // 화
      { wch: 15 },  // 수
      { wch: 15 },  // 목
      { wch: 15 },  // 금
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, `${grade}학년`);
  }
  
  XLSX.writeFile(wb, `학급별_시간표_${semester}학기.xlsx`);
};
