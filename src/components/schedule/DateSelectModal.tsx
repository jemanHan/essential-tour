import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 커스텀 날짜 선택기 컴포넌트 (삭제/오늘 버튼 없음)
interface CustomDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate: Date;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selectedDate, onDateChange, minDate }) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  // 선택된 날짜가 변경되면 해당 월로 이동
  React.useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // 해당 월의 첫 번째 날과 마지막 날
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
  
  const isDateDisabled = (date: Date) => {
    // 오늘 이전 날짜만 비활성화 (오늘은 선택 가능)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  return (
    <div className="bg-white rounded-lg">
      {/* 월/년도 네비게이션 */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {new Intl.DateTimeFormat(t('locale') || 'ko', { 
            year: 'numeric', 
            month: 'long' 
          }).format(new Date(year, month, 1))}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 p-2">
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
      <div className="grid grid-cols-7 gap-1 p-2">
        {calendarDays.map((dayInfo, index) => {
          const isSelected = isSameDate(dayInfo.date, selectedDate);
          const isCurrentDay = isToday(dayInfo.date);
          const isDisabled = isDateDisabled(dayInfo.date);
          
          return (
            <button
              key={index}
              onClick={() => {
                if (!isDisabled) {
                  // 시간대 문제 해결: UTC 기준으로 정규화
                  const year = dayInfo.date.getFullYear();
                  const month = dayInfo.date.getMonth();
                  const day = dayInfo.date.getDate();
                  
                  // UTC 기준으로 새로운 Date 객체 생성 (시간대 문제 완전 해결)
                  const normalizedDate = new Date(Date.UTC(year, month, day));
                  onDateChange(normalizedDate);
                }
              }}
              disabled={isDisabled}
              className={`
                aspect-square text-sm font-medium rounded-md transition-colors
                ${!dayInfo.isCurrentMonth 
                  ? 'text-gray-300 bg-gray-50' 
                  : isSelected
                  ? 'bg-blue-500 text-white'
                  : isCurrentDay
                  ? 'bg-red-100 text-red-600 border-2 border-red-300'
                  : isDisabled
                  ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
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

interface DateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  placeName: string;
}

const DateSelectModal: React.FC<DateSelectModalProps> = ({
  isOpen,
  onClose,
  onDateSelect,
  placeName
}) => {
  const { t } = useTranslation();
  // 한국 시간대 기준으로 오늘 날짜 설정
  const getTodayInKST = () => {
    const now = new Date();
    const kstOffset = 9 * 60; // KST는 UTC+9
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kst = new Date(utc + (kstOffset * 60000));
    return kst;
  };
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = getTodayInKST();
    return isNaN(today.getTime()) ? new Date() : today;
  });

  const handleConfirm = () => {
    // 시간대 문제 해결: UTC 기준으로 정규화
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    
    // UTC 기준으로 새로운 Date 객체 생성 (시간대 문제 완전 해결)
    const normalizedDate = new Date(Date.UTC(year, month, day));
    onDateSelect(normalizedDate);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          📅 {t('scheduleDateSelection')}
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {t('selectDateForSchedule', { placeName })}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('selectDate')}
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <CustomDatePicker 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              minDate={getTodayInKST()}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
          >
            {t('goToSchedulePage')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelectModal;

