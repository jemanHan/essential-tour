/**
 * 관광공사 API 장소 상세정보 모달 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Phone, Calendar } from 'lucide-react';
import { TourItem } from '../api/tourApi';

// 카테고리 타입 정의
export type ScheduleCategory = '관광' | '식사' | '쇼핑' | '교통' | '숙박' | '기타';

// 카테고리 자동 감지 함수
const detectCategory = (tourItem: TourItem): ScheduleCategory => {
  // contenttypeid 기반으로 우선 판단
  const contentTypeId = tourItem.contenttypeid;
  
  // 한국관광공사 API contenttypeid 매핑
  if (contentTypeId === '39') {
    return '식사'; // 맛집 (음식점)
  }
  if (contentTypeId === '32') {
    return '숙박'; // 숙박
  }
  if (contentTypeId === '38') {
    return '쇼핑'; // 쇼핑
  }
  if (contentTypeId === '14') {
    return '문화시설'; // 문화시설
  }
  
  // contenttypeid로 판단되지 않는 경우 키워드 기반 판단
  const title = tourItem.title.toLowerCase();
  const cat1 = tourItem.cat1?.toLowerCase() || '';
  const cat2 = tourItem.cat2?.toLowerCase() || '';
  const cat3 = tourItem.cat3?.toLowerCase() || '';
  
  // 숙박 관련 키워드
  const accommodationKeywords = ['호텔', '펜션', '모텔', '게스트하우스', '리조트', '콘도', '민박', '캠핑', '숙박'];
  if (accommodationKeywords.some(keyword => 
    title.includes(keyword) || cat1.includes(keyword) || cat2.includes(keyword) || cat3.includes(keyword)
  )) {
    return '숙박';
  }
  
  // 식사 관련 키워드
  const restaurantKeywords = ['맛집', '식당', '카페', '레스토랑', '음식', '요리', '한식', '중식', '일식', '양식', '분식', '치킨', '피자', '햄버거'];
  if (restaurantKeywords.some(keyword => 
    title.includes(keyword) || cat1.includes(keyword) || cat2.includes(keyword) || cat3.includes(keyword)
  )) {
    return '식사';
  }
  
  // 쇼핑 관련 키워드
  const shoppingKeywords = ['쇼핑', '마트', '백화점', '상가', '시장', '기념품', '상점', '아울렛', '몰'];
  if (shoppingKeywords.some(keyword => 
    title.includes(keyword) || cat1.includes(keyword) || cat2.includes(keyword) || cat3.includes(keyword)
  )) {
    return '쇼핑';
  }
  
  // 교통 관련 키워드
  const transportKeywords = ['역', '터미널', '공항', '버스', '지하철', '택시', '렌터카', '주차'];
  if (transportKeywords.some(keyword => 
    title.includes(keyword) || cat1.includes(keyword) || cat2.includes(keyword) || cat3.includes(keyword)
  )) {
    return '교통';
  }
  
  // 관광 관련 키워드 (기본값)
  const tourismKeywords = ['관광', '명소', '유적', '박물관', '미술관', '공원', '산', '바다', '해변', '온천', '스파'];
  if (tourismKeywords.some(keyword => 
    title.includes(keyword) || cat1.includes(keyword) || cat2.includes(keyword) || cat3.includes(keyword)
  )) {
    return '관광';
  }
  
  // 기본값은 관광
  return '관광';
};

interface TourItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourItem: TourItem | null;
}

const TourItemModal: React.FC<TourItemModalProps> = ({ isOpen, onClose, tourItem }) => {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 로딩 상태 초기화
  useEffect(() => {
    if (isOpen && tourItem) {
      setLoading(false);
      setError(null);
      setDetail(null);
      setImages([]);
    }
  }, [isOpen, tourItem]);

  const handleClose = () => {
    setDetail(null);
    setImages([]);
    setError(null);
    onClose();
  };

  const handleScheduleAdd = () => {
    if (!tourItem) return;
    
    const placeName = tourItem.title;
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const category = detectCategory(tourItem);
    
    // 스케줄 페이지로 이동 (카테고리 포함)
    window.open(`/schedule?place=${encodeURIComponent(placeName)}&date=${dateString}&category=${category}`, '_blank');
  };

  if (!isOpen || !tourItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 컨텐츠 - 더 크고 동적 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* 헤더 - 하늘색 계열 그라데이션 및 장식 요소 */}
        <div className="relative bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 p-6 text-white overflow-hidden">
          {/* 장식 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-white">{tourItem.title}</h2>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{tourItem.addr1}</span>
                </div>
                {tourItem.tel && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{tourItem.tel}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 이미지와 기본 정보 */}
            <div className="space-y-6">
              {/* 이미지 - 더 큰 크기 */}
              {tourItem.firstimage && (
                <div className="relative group overflow-hidden rounded-xl">
                  <img
                    src={tourItem.firstimage}
                    alt={tourItem.title}
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}

              {/* 상세 정보 카드 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {t('detailInfo')}
                </h3>
                
                <div className="space-y-4">
                  {/* 주소 */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{t('address')}</p>
                      <p className="text-gray-600">
                        {tourItem.addr1}
                        {tourItem.addr2 && ` ${tourItem.addr2}`}
                      </p>
                    </div>
                  </div>

                  {/* 전화번호 */}
                  {tourItem.tel && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <Phone className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">{t('phoneNumber')}</p>
                        <p className="text-gray-600">{tourItem.tel}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 액션 버튼들과 추가 정보 */}
            <div className="space-y-6">
              {/* 액션 버튼들 - 더 예쁘게 */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {t('quickActions')}
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={handleScheduleAdd}
                    className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">{t('addToSchedule')}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => {
                      const query = encodeURIComponent(tourItem.title);
                      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
                      window.open(mapsUrl, '_blank');
                    }}
                    className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="font-semibold">{t('viewOnGoogleMaps')}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 추가 정보 카드 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  {t('travelTips')}
                </h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                    <span className="text-sm">{t('tipCheckHours')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                    <span className="text-sm">{t('tipTransport')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                    <span className="text-sm">{t('tipWeather')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourItemModal;
