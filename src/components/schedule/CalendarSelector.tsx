import React, { useState } from 'react';
import Calendar from './Calendar';

interface CalendarSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedCalendar: string;
  onCalendarChange: (calendarId: string) => void;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  selectedDate,
  onDateChange,
  selectedCalendar,
  onCalendarChange
}) => {
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // 이전 달, 현재 달, 다음 달 계산
  const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);

  // 년도 선택 옵션 (현재 년도 기준 ±5년)
  const currentYear = selectedDate.getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // 월 선택 옵션
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleYearChange = (year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    onDateChange(newDate);
    setShowYearSelector(false);
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(month - 1);
    onDateChange(newDate);
    setShowMonthSelector(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">달력선택</h2>
      
      {/* 년도/월 선택 토글 버튼 */}
      <div className="flex gap-2 mb-6">
        <div className="relative">
          <button
            onClick={() => setShowYearSelector(!showYearSelector)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            {selectedDate.getFullYear()}년
          </button>
          {showYearSelector && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  {year}년
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMonthSelector(!showMonthSelector)}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            {selectedDate.getMonth() + 1}월
          </button>
          {showMonthSelector && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {monthOptions.map((month) => (
                <button
                  key={month}
                  onClick={() => handleMonthChange(month)}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  {month}월
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 달력 선택 블록들 */}
      <div className="space-y-4">
        {/* 이전 달 */}
        <div
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedCalendar === 'prev-month' 
              ? 'bg-pink-200 border-2 border-pink-300' 
              : 'bg-yellow-100 hover:bg-yellow-200'
          }`}
          onClick={() => onCalendarChange('prev-month')}
        >
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">
              {prevMonth.getFullYear()}년 {prevMonth.getMonth() + 1}월
            </div>
            <div className="text-lg font-bold text-gray-800">달력</div>
          </div>
        </div>

        {/* 현재 달 */}
        <div
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedCalendar === 'current-month' 
              ? 'bg-pink-200 border-2 border-pink-300' 
              : 'bg-yellow-100 hover:bg-yellow-200'
          }`}
          onClick={() => onCalendarChange('current-month')}
        >
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </div>
            <div className="text-lg font-bold text-gray-800">
              달력 {selectedCalendar === 'current-month' ? '(선택)' : ''}
            </div>
          </div>
        </div>

        {/* 다음 달 */}
        <div
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedCalendar === 'next-month' 
              ? 'bg-pink-200 border-2 border-pink-300' 
              : 'bg-yellow-100 hover:bg-yellow-200'
          }`}
          onClick={() => onCalendarChange('next-month')}
        >
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">
              {nextMonth.getFullYear()}년 {nextMonth.getMonth() + 1}월
            </div>
            <div className="text-lg font-bold text-gray-800">달력</div>
          </div>
        </div>
      </div>

      {/* 선택된 달력 표시 */}
      <div className="mt-6">
        <Calendar 
          date={selectedCalendar === 'prev-month' ? prevMonth : 
                selectedCalendar === 'next-month' ? nextMonth : currentMonth}
          selectedDate={selectedDate}
          onDateSelect={onDateChange}
        />
      </div>
    </div>
  );
};

export default CalendarSelector;
