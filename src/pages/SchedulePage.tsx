import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import MonthCalendar from '../components/calendar/MonthCalendar';
import ScheduleDisplay from '../components/schedule/ScheduleDisplay';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import { useSchedule } from '../hooks/useSchedule';

const SchedulePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchParams] = useSearchParams();
  const [initialPlaceName, setInitialPlaceName] = useState<string>('');
  const [defaultCategory, setDefaultCategory] = useState<string>('관광');
  const navigate = useNavigate();

  // URL 파라미터에서 장소명, 날짜, 카테고리 가져오기
  useEffect(() => {
    const place = searchParams.get('place');
    const date = searchParams.get('date');
    const category = searchParams.get('category');
    
    if (place) {
      setInitialPlaceName(decodeURIComponent(place));
    }
    
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
    
    if (category) {
      setDefaultCategory(decodeURIComponent(category));
    }
  }, [searchParams]);


  const handleDateSelect = (date: Date) => {
    // 시간대 문제 해결: UTC 기준으로 정규화
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // UTC 기준으로 새로운 Date 객체 생성 (시간대 문제 완전 해결)
    const normalizedDate = new Date(Date.UTC(year, month, day));
    setSelectedDate(normalizedDate);
  };

  return (
    <>
      <TopBar />
      <main className="container mx-auto px-4 py-6 pt-16 md:pt-20 dark:bg-gray-900">
        {/* 페이지 제목 - Home/Login과 동일한 스타일 적용 */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">{t('scheduleManagement')}</h1>
        
        {/* 메인 컨텐츠 그리드 - Home과 동일한 반응형 그리드 패턴 적용 */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* 왼쪽 패널 - 달력 */}
          <div className="space-y-6">
            <div className="card bg-base-100 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <MonthCalendar 
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </div>
          </div>
          
          {/* 오른쪽 패널 - 스케줄 표시 */}
          <div className="space-y-6">
            <div className="card bg-base-100 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 rounded-lg">
              <ScheduleDisplay 
                selectedDate={selectedDate} 
                initialPlaceName={initialPlaceName}
                defaultCategory={defaultCategory}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingActionButton />
    </>
  );
};

export default SchedulePage;
