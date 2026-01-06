'use client';

interface SemesterSelectorProps {
  semester: 1 | 2;
  onSemesterChange: (semester: 1 | 2) => void;
}

export function SemesterSelector({ semester, onSemesterChange }: SemesterSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onSemesterChange(1)}
        className={`
          neo-button px-4 py-2 rounded-lg font-bold
          ${semester === 1
            ? 'bg-[#FFE135] shadow-[4px_4px_0px_#000]'
            : 'bg-white hover:bg-gray-100'
          }
        `}
      >
        1학기
      </button>
      <button
        onClick={() => onSemesterChange(2)}
        className={`
          neo-button px-4 py-2 rounded-lg font-bold
          ${semester === 2
            ? 'bg-[#4ECDC4] shadow-[4px_4px_0px_#000]'
            : 'bg-white hover:bg-gray-100'
          }
        `}
      >
        2학기
      </button>
    </div>
  );
}
