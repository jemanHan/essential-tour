import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MonthCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    // selectedDate가 있으면 해당 월로, 없으면 현재 월로
    return selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date();
  });
  const { t, i18n } = useTranslation();
  
  // selectedDate가 변경되면 해당 월로 이동
  React.useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  // 현재 월의 첫 번째 날과 마지막 날 계산
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // 달력에 표시할 첫 번째 날 (이전 달의 일부 포함)
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  firstDayOfCalendar.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
  
  // 달력에 표시할 마지막 날 (다음 달의 일부 포함)
  const lastDayOfCalendar = new Date(lastDayOfMonth);
  lastDayOfCalendar.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

  // 달력에 표시할 모든 날짜 생성
  const calendarDays: Date[] = [];
  const current = new Date(firstDayOfCalendar);
  
  while (current <= lastDayOfCalendar) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 이전 월로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 다음 월로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 현재 월의 날짜인지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // 선택된 날짜인지 확인
  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // 요일 헤더 - 현지화
  const getWeekdayLabels = (lang: string) => {
    const base = new Date(2021, 7, 1); // Sunday
    return Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)));
  };
  const weekDays = getWeekdayLabels(i18n.language || 'ko');

  return (
    <div className="max-w-4xl mx-auto">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {new Intl.DateTimeFormat(i18n.language || 'ko', { year: 'numeric', month: 'long' }).format(currentDate)}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 달력 그리드 */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-gray-100 border-b-2 border-gray-300">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`p-4 text-center font-bold text-sm border-r border-gray-300 last:border-r-0 ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-800'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => (
            <div
              key={index}
              onClick={() => {
                if (onDateSelect) {
                  // 시간대 문제 해결: UTC 기준으로 정규화
                  const year = date.getFullYear();
                  const month = date.getMonth();
                  const day = date.getDate();
                  
                  // UTC 기준으로 새로운 Date 객체 생성 (시간대 문제 완전 해결)
                  const normalizedDate = new Date(Date.UTC(year, month, day));
                  onDateSelect(normalizedDate);
                }
              }}
              className="h-12 p-1 border-r border-b border-gray-300 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              style={{
                backgroundColor: !isCurrentMonth(date) 
                  ? '#f9fafb' 
                  : isSelectedDate(date) 
                    ? '#93c5fd' 
                    : isToday(date) 
                      ? '#86efac' 
                      : '#ffffff'
              }}
            >
              <span
                className="text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  color: !isCurrentMonth(date) 
                    ? '#9ca3af' 
                    : isSelectedDate(date) 
                      ? '#1e40af' 
                      : isToday(date) 
                        ? '#166534' 
                        : '#374151',
                  fontWeight: isSelectedDate(date) || isToday(date) ? 'bold' : 'normal'
                }}
              >
                {date.getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 달력 범례 */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200/70 rounded"></div>
          <span>{t('today') || '오늘'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-200/70 rounded"></div>
          <span>{t('selectedDate') || '선택된 날짜'}</span>
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
