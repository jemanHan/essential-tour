import React from 'react';

interface CalendarProps {
  date: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ date, selectedDate, onDateSelect }) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  // 해당 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // 첫 번째 날의 요일 (0: 일요일, 1: 월요일, ...)
  const firstDayOfWeek = firstDay.getDay();
  
  // 해당 월의 총 일수
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

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDate(date, today);
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {year}년 {month + 1}월
        </h3>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((weekday, index) => (
          <div
            key={weekday}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {weekday}
          </div>
        ))}
      </div>
      
      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          return (
            <button
              key={index}
              onClick={() => onDateSelect(dayInfo.date)}
              className={`
                aspect-square text-sm font-medium rounded-md transition-colors relative
                ${!dayInfo.isCurrentMonth 
                  ? 'text-gray-300 bg-gray-50' 
                  : isSameDate(dayInfo.date, selectedDate)
                  ? 'bg-blue-500 text-white'
                  : isToday(dayInfo.date)
                  ? 'bg-red-100 text-red-600 border-2 border-red-300'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {dayInfo.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
