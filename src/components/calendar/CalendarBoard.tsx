import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  category: string;
  color?: string;
}

interface CalendarBoardProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  schedules?: { [key: string]: ScheduleItem[] };
  className?: string;
  showLegend?: boolean;
}

const CalendarBoard: React.FC<CalendarBoardProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  schedules = {},
  className = '',
  showLegend = true
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const { t, i18n } = useTranslation();

  // 월 전환 함수들
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  // 달력 데이터 생성
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  // 이전 달의 마지막 날들
  const prevMonthLastDay = new Date(year, month, 0);
  const prevMonthDays = prevMonthLastDay.getDate();
  
  // 달력 그리드 생성
  const calendarDays = [];
  
  // 이전 달의 날들
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    calendarDays.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      day
    });
  }
  
  // 현재 달의 날들
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
      day
    });
  }
  
  // 다음 달의 날들 (42개 셀을 채우기 위해)
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
      day
    });
  }

  const getWeekdayLabels = (lang: string) => {
    // 좁은 형식으로 고정 폭 맞춤 (S, M, T...) → 한글은 일, 월...로 깔끔 정렬
    const base = new Date(2021, 7, 1); // 2021-08-01 is Sunday
    return Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(lang, { weekday: 'narrow' }).format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)));
  };
  const weekdays = getWeekdayLabels(i18n.language || 'ko');

  // 날짜 비교 함수들
  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDate(date, today);
  };

  const isSelected = (date: Date) => {
    return selectedDate && isSameDate(date, selectedDate);
  };

  // 날짜 키 생성
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      '관광': 'bg-blue-50 text-blue-700 border-blue-200',
      '식사': 'bg-green-50 text-green-700 border-green-200',
      '쇼핑': 'bg-purple-50 text-purple-700 border-purple-200',
      '교통': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      '숙박': 'bg-pink-50 text-pink-700 border-pink-200',
      '기타': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colorMap[category] || colorMap['기타'];
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
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
          {new Intl.DateTimeFormat(i18n.language || 'ko', { year: 'numeric', month: 'long' }).format(currentMonth)}
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
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`h-12 flex items-center justify-center font-bold text-sm border-r border-gray-300 last:border-r-0 ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-800'
              }`}
            >
              <span className="uppercase tracking-wide font-mono">{day}</span>
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayInfo, index) => {
            const daySchedules = schedules[getDateKey(dayInfo.date)] || [];
            const hasSchedules = daySchedules.length > 0;
            const isCurrentDay = isToday(dayInfo.date);
            const isSelectedDay = isSelected(dayInfo.date);

            return (
              <div
                key={index}
                onClick={() => onDateSelect?.(dayInfo.date)}
                className="h-12 p-1 border-r border-b border-gray-300 cursor-pointer hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: !dayInfo.isCurrentMonth 
                    ? '#f9fafb' 
                    : isSelectedDay 
                      ? '#93c5fd' 
                      : isCurrentDay 
                        ? '#86efac' 
                        : '#ffffff'
                }}
              >
                <span
                  className="text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full"
                  style={{
                    color: !dayInfo.isCurrentMonth 
                      ? '#9ca3af' 
                      : isSelectedDay 
                        ? '#1e40af' 
                        : isCurrentDay 
                          ? '#166534' 
                          : '#374151',
                    fontWeight: isSelectedDay || isCurrentDay ? 'bold' : 'normal'
                  }}
                >
                  {dayInfo.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 달력 범례 */}
      {showLegend && (
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200/70 rounded"></div>
            <span>{t('today') || '오늘'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-200/70 rounded"></div>
            <span>{t('selectedDate') || '선택된 날짜'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200/70 rounded"></div>
            <span>{t('otherMonth') || '다른 달'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarBoard;


