import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../api/http.js'
import { getApiUrl } from '../config/api.js'
import { isAuthenticated } from '../api/auth.js'
import { checkLikeStatus, addLike, removeLike } from '../api/likes'
import { addRecentView } from '../api/recentViews.js'
import DateSelectModal from '../components/schedule/DateSelectModal'
import { getRestaurants, getAccommodations, TourItem } from '../api/tourApi'
import TourItemModal from '../components/TourItemModal'
import TopBar from '../components/layout/TopBar'
import Footer from '../components/layout/Footer'
import FloatingActionButton from '../components/layout/FloatingActionButton'

type SortOption = 'relevance' | 'latest';

type Review = {
  author?: {
    displayName?: string
  }
  rating?: number
  text?: string | { text: string }
  relativePublishTimeDescription?: string
  publishTime?: string
  authorAttribution?: {
    displayName?: string
    uri?: string
    photoUri?: string
  }
  reviewCount?: number
  photoCount?: number
  isLocalGuide?: boolean
}

type PlaceDetails = {
  id: string
  displayName: any
  rating?: number
  userRatingCount?: number
  websiteUri?: string
  internationalPhoneNumber?: string
  formattedPhoneNumber?: string
  formattedAddress?: string
  openingHours?: {
    weekdayDescriptions?: string[]
  }
  businessStatus?: string
  priceLevel?: string
  editorialSummary?: any
  photos?: { name: string; widthPx?: number; heightPx?: number }[]
  reviews?: Review[]
  location?: { latitude: number; longitude: number }
  categories?: string[]
  types?: string[]
}

const MOCK_DETAIL: PlaceDetails = {
  id: 'mock-1',
  displayName: { text: '모의 여행지 A' },
  rating: 4.6,
  userRatingCount: 128,
  editorialSummary: { text: '백엔드 없이도 보이는 상세 설명 예시입니다.' },
  websiteUri: 'https://example.com',
  photos: [{ name: 'https://picsum.photos/seed/a/1200/800' }],
  reviews: [
    { author: { displayName: '홍길동' }, rating: 5, text: '정말 좋았어요!', relativePublishTimeDescription: '2 days ago' },
    { author: { displayName: '김철수' }, rating: 4, text: '가볼만 합니다.', relativePublishTimeDescription: '1 week ago' }
  ]
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<PlaceDetails | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('relevance')
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())
  const [showReviews, setShowReviews] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likedLoading, setLikedLoading] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [nearbyRestaurants, setNearbyRestaurants] = useState<TourItem[]>([])
  const [nearbyAccommodations, setNearbyAccommodations] = useState<TourItem[]>([])
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [hasFetchedNearby, setHasFetchedNearby] = useState(false)
  const fetchingNearbyRef = useRef(false)
  const [selectedTourItem, setSelectedTourItem] = useState<TourItem | null>(null)
  const [showTourModal, setShowTourModal] = useState(false)
  
  // 더 보기 기능을 위한 상태 - 단순화
  const [allRestaurants, setAllRestaurants] = useState<TourItem[]>([])
  const [allAccommodations, setAllAccommodations] = useState<TourItem[]>([])
  const [displayedRestaurantCount, setDisplayedRestaurantCount] = useState(3)
  const [displayedAccommodationCount, setDisplayedAccommodationCount] = useState(3)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // 로컬 개발용 캐시 키 생성
  const getCacheKey = (lat: number, lng: number, type: 'restaurants' | 'accommodations') => {
    const roundedLat = Math.round(lat * 100) / 100; // 소수점 2자리로 반올림
    const roundedLng = Math.round(lng * 100) / 100;
    return `dev_cache_${type}_${roundedLat}_${roundedLng}`;
  };
  
  // 로컬 스토리지에서 캐시된 데이터 로드
  const loadFromCache = (lat: number, lng: number, type: 'restaurants' | 'accommodations'): TourItem[] => {
    try {
      const cacheKey = getCacheKey(lat, lng, type);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        console.log(`📦 캐시에서 ${type} 로드:`, data.length, '개');
        return data;
      }
    } catch (error) {
      console.warn('캐시 로드 실패:', error);
    }
    return [];
  };
  
  // 로컬 스토리지에 데이터 저장
  const saveToCache = (lat: number, lng: number, type: 'restaurants' | 'accommodations', data: TourItem[]) => {
    try {
      const cacheKey = getCacheKey(lat, lng, type);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 ${type} 캐시 저장:`, data.length, '개');
      }
    } catch (error) {
      console.warn('캐시 저장 실패:', error);
    }
  };
  
  // 개발용 캐시 관리 함수들 (전역으로 노출)
  useEffect(() => {
    (window as any).devCache = {
      // 캐시 확인
      list: () => {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('dev_cache_'));
        console.log('📦 개발 캐시 목록:', keys);
        keys.forEach(key => {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          console.log(`${key}: ${data.length}개`);
        });
        return keys;
      },
      // 캐시 삭제
      clear: () => {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('dev_cache_'));
        keys.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ 개발 캐시 삭제 완료');
      },
      // 특정 위치 캐시 삭제
      clearLocation: (lat: number, lng: number) => {
        const restaurantKey = getCacheKey(lat, lng, 'restaurants');
        const accommodationKey = getCacheKey(lat, lng, 'accommodations');
        localStorage.removeItem(restaurantKey);
        localStorage.removeItem(accommodationKey);
        console.log('🗑️ 위치별 캐시 삭제 완료:', lat, lng);
      }
    };
  }, []);
  
  // 이미지 네비게이션 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // 이미지 프리로딩 함수
  const preloadImages = (photos: any[], startIndex: number) => {
    if (!photos || photos.length <= 1) return;
    
    // 다음 2개 이미지 미리 로드
    for (let i = 1; i <= 2; i++) {
      const nextIndex = (startIndex + i) % photos.length;
      const photo = photos[nextIndex];
      if (photo && photo.name) {
        const url = getApiUrl(`/v1/places/${encodeURIComponent(data?.id || '')}/photos/media?name=${encodeURIComponent(photo.name)}&maxWidthPx=1200`);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🖼️ 이미지 프리로드 완료: ${nextIndex + 1}/${photos.length}`);
          }
        };
      }
    }
  };
  
  // 이미지 인덱스 변경 시 프리로딩 실행
  useEffect(() => {
    if (data?.photos && data.photos.length > 1) {
      preloadImages(data.photos, currentImageIndex);
    }
  }, [currentImageIndex, data?.photos]);

  // 거리 계산 함수 (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (id) {
      // 상태 초기화
      setData(null)
      setNearbyRestaurants([])
      setNearbyAccommodations([])
      setHasFetchedNearby(false)
      
      void fetchDetail(id)
      void checkLikeStatusOnMount(id)
    }
  }, [id])

  // 언어 변경 시 API 다시 호출
  useEffect(() => {
    if (id && data) {
      void fetchDetail(id)
    }
  }, [i18n.language])

  // 주변 맛집/숙소 가져오기 (한 번만)
  useEffect(() => {
    if (data?.location && !hasFetchedNearby) {
      fetchNearbyPlaces()
    }
  }, [data?.location, hasFetchedNearby])

  const fetchNearbyPlaces = async () => {
    if (!data?.location || hasFetchedNearby || fetchingNearbyRef.current) return
    
    setLoadingNearby(true)
    fetchingNearbyRef.current = true
    setHasFetchedNearby(true) // 중복 호출 방지
    
    try {
      console.log('🔍 주변 장소 조회 시작:', data.location)
      
      // 먼저 캐시에서 로드 시도
      const cachedRestaurants = loadFromCache(data.location.latitude, data.location.longitude, 'restaurants');
      const cachedAccommodations = loadFromCache(data.location.latitude, data.location.longitude, 'accommodations');
      
      let restaurants = cachedRestaurants;
      let accommodations = cachedAccommodations;
      
      // 캐시에 데이터가 없거나 부족한 경우 API 호출 (지연 로딩)
      if (restaurants.length === 0) {
        console.log('🚀 맛집 API 호출 시작');
        try {
          const lang = (i18n.language || 'ko').split('-')[0];
          restaurants = await getRestaurants(
            data.location.longitude,
            data.location.latitude,
            5000,
            20,
            1,
            lang
          );
          saveToCache(data.location.latitude, data.location.longitude, 'restaurants', restaurants);
        } catch (error) {
          console.error('맛집 API 호출 실패:', error);
        }
        
        // API 호출 간격 조정 (Rate Limit 방지)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (accommodations.length === 0) {
        console.log('🚀 숙소 API 호출 시작');
        try {
          const lang = (i18n.language || 'ko').split('-')[0];
          accommodations = await getAccommodations(
            data.location.longitude,
            data.location.latitude,
            5000,
            20,
            1,
            lang
          );
          saveToCache(data.location.latitude, data.location.longitude, 'accommodations', accommodations);
        } catch (error) {
          console.error('숙소 API 호출 실패:', error);
        }
      }
      
      if (restaurants.length > 0 || accommodations.length > 0) {
        console.log('📦 캐시 사용:', restaurants.length, '맛집,', accommodations.length, '숙소');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🍜 맛집 결과:', restaurants)
        console.log('🏨 숙소 결과:', accommodations)
      }
      
      // 이미지가 있는 항목을 우선적으로 정렬하고 중복 제거
      const restaurantsWithImages = restaurants
        .filter(restaurant => restaurant.firstimage)
        .filter((restaurant, index, self) => 
          index === self.findIndex(r => r.contentid === restaurant.contentid)
        )
        .sort((a, b) => {
          // 거리순으로 정렬
          const distA = calculateDistance(data.location.latitude, data.location.longitude, parseFloat(a.mapy), parseFloat(a.mapx));
          const distB = calculateDistance(data.location.latitude, data.location.longitude, parseFloat(b.mapy), parseFloat(b.mapx));
          return distA - distB;
        });
      
      const accommodationsWithImages = accommodations
        .filter(accommodation => accommodation.firstimage)
        .filter((accommodation, index, self) => 
          index === self.findIndex(a => a.contentid === accommodation.contentid)
        )
        .sort((a, b) => {
          // 거리순으로 정렬
          const distA = calculateDistance(data.location.latitude, data.location.longitude, parseFloat(a.mapy), parseFloat(a.mapx));
          const distB = calculateDistance(data.location.latitude, data.location.longitude, parseFloat(b.mapy), parseFloat(b.mapx));
          return distA - distB;
        });
      
            // 모든 데이터 저장 (이미지가 있는 항목만)
            setAllRestaurants(restaurantsWithImages);
            setAllAccommodations(accommodationsWithImages);
            
            // 처음에는 3개씩만 표시
            setDisplayedRestaurantCount(3);
            setDisplayedAccommodationCount(3);
            
            // 기존 상태도 업데이트 (호환성 유지)
            setNearbyRestaurants(restaurantsWithImages.slice(0, 3));
            setNearbyAccommodations(accommodationsWithImages.slice(0, 3));
            
            if (process.env.NODE_ENV === 'development') {
              console.log('🍜 맛집 초기 로드:', {
                total: restaurantsWithImages.length,
                displayed: 3
              });
              console.log('🏨 숙소 초기 로드:', {
                total: accommodationsWithImages.length,
                displayed: 3
              });
            }
    } catch (err) {
      console.error('주변 장소 조회 실패:', err)
      setHasFetchedNearby(false) // 실패 시 재시도 가능하도록
    } finally {
      setLoadingNearby(false)
      fetchingNearbyRef.current = false
    }
  }

  async function checkLikeStatusOnMount(placeId: string) {
    if (!isAuthenticated()) return;
    
    try {
      const status = await checkLikeStatus(placeId);
      setLiked(status.liked);
    } catch (error) {
      console.error('Check like status error:', error);
    }
  }

  async function fetchDetail(placeId: string) {
    try {
      const json = await api('/v1/places/' + encodeURIComponent(placeId));
      
      // Backend now returns mapped data, just use it directly
      setData(json);
      
      // 최근 본 장소에 추가 (인증된 사용자만) - 중복 방지
      console.log('🔍 최근 본 장소 저장 체크:', {
        isAuthenticated: isAuthenticated(),
        placeId: placeId,
        hasToken: !!localStorage.getItem('vk_token'),
        placeName: typeof json.displayName === 'object' ? json.displayName?.text : json.displayName
      });
      
      if (isAuthenticated()) {
        try {
          const recentKey = `recent-added:${placeId}`
          // 세션 스토리지 중복 방지 로직을 제거하여 매번 최근 본 여행지에 추가
          console.log('🔄 최근 본 장소 추가 진행:', recentKey);
          const raw = json.categories ?? json.types ?? [];
          const tags = Array.from(new Set(raw.map(t => String(t).toLowerCase().trim()))).slice(0, 8);
          
          console.log('✅ 최근 본 장소 추가 시도:', {
            placeId: placeId,
            name: typeof json.displayName === 'object' ? json.displayName?.text : json.displayName,
            address: json.formattedAddress,
            rating: json.rating,
            tags: tags as string[],
            recentKey: recentKey
          });
          
          const result = await addRecentView(
            String(placeId),
            typeof json.displayName === 'object' ? json.displayName?.text : json.displayName,
            json.formattedAddress,
            json.rating,
            tags as string[]
          );
          
          console.log('✅ 최근 본 장소 저장 성공:', result);
          // 세션 스토리지 설정은 유지 (디버깅용)
          sessionStorage.setItem(recentKey, '1');
        } catch (error) {
          console.error('❌ 최근 본 장소 저장 실패:', error);
          console.error('❌ 에러 상세:', {
            placeId: placeId,
            placeName: typeof json.displayName === 'object' ? json.displayName?.text : json.displayName,
            error: error
          });
          // 최근 본 장소 추가 실패는 사용자에게 알리지 않음 (부가 기능)
        }
      } else {
        console.log('⚠️ 인증되지 않은 사용자 - 최근 본 장소 저장 건너뜀');
      }
    } catch (error) {
      console.error('Error fetching detail:', error);
      // Use fallback description from sessionStorage if available
      const fallbackDesc = sessionStorage.getItem(`fallback-desc:${placeId}`);
      if (fallbackDesc) {
        setData({ ...MOCK_DETAIL, editorialSummary: fallbackDesc });
      } else {
        setData(MOCK_DETAIL);
      }
    }
  }

  async function handleLike() {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!data || !id) return;

    setLikedLoading(true);
    try {
      if (liked) {
        // 좋아요 취소
        await removeLike(id);
        setLiked(false);
      } else {
        // 좋아요 추가
        const raw = data.categories ?? data.types ?? [];
        const tags = Array.from(new Set(raw.map(t => String(t).toLowerCase().trim()))).slice(0, 8);

        await addLike(
          id,
          typeof data.displayName === 'object' ? data.displayName?.text : data.displayName,
          data.formattedAddress,
          data.rating,
          tags as string[]
        );

        setLiked(true);
      }
    } catch (error) {
      console.error('Like error:', error);
      alert(liked ? '좋아요 취소에 실패했습니다.' : '좋아요 저장에 실패했습니다.');
    } finally {
      setLikedLoading(false);
    }
  }

  function handleAddToSchedule() {
    setShowDateModal(true)
  }

  const handleTourItemClick = (tourItem: TourItem) => {
    setSelectedTourItem(tourItem)
    setShowTourModal(true)
  }

  // 더 보기 버튼 핸들러 - 단순화된 로직
  const handleLoadMore = async (type: 'restaurants' | 'accommodations') => {
    console.log(`🔄 더보기 클릭: ${type}`);
    setLoadingMore(true);
    
    try {
      if (type === 'restaurants') {
        const newCount = Math.min(displayedRestaurantCount + 3, allRestaurants.length);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🍜 맛집 표시 개수 변경: ${displayedRestaurantCount} → ${newCount}`);
        }
        setDisplayedRestaurantCount(newCount);
        setNearbyRestaurants(allRestaurants.slice(0, newCount));
      } else {
        const newCount = Math.min(displayedAccommodationCount + 3, allAccommodations.length);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🏨 숙소 표시 개수 변경: ${displayedAccommodationCount} → ${newCount}`);
        }
        setDisplayedAccommodationCount(newCount);
        setNearbyAccommodations(allAccommodations.slice(0, newCount));
      }
    } catch (error) {
      console.error('더 보기 로드 실패:', error);
    } finally {
      setLoadingMore(false);
    }
  }

  // 이미지 네비게이션 함수들
  const handlePrevImage = () => {
    if (!data?.photos) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? Math.min(data.photos!.length - 1, 4) : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!data?.photos) return;
    setCurrentImageIndex(prev => 
      prev === Math.min(data.photos!.length - 1, 4) ? 0 : prev + 1
    );
  };

  function handleDateSelect(date: Date) {
    const placeName = data?.displayName?.text || '장소'
    const dateString = date.toISOString().split('T')[0]
    
    // 장소 타입 기반으로 스케줄 카테고리 결정
    let scheduleCategory = '관광'; // 기본값
    
    if (data?.types) {
      const types = data.types;
      
      // 식사 관련 타입
      if (types.some(type => 
        type.toLowerCase().includes('restaurant') || 
        type.toLowerCase().includes('food') || 
        type.toLowerCase().includes('meal') ||
        type.toLowerCase().includes('cafe') ||
        type.toLowerCase().includes('bar') ||
        type.toLowerCase().includes('bakery') ||
        type.toLowerCase().includes('meal_takeaway') ||
        type.toLowerCase().includes('meal_delivery')
      )) {
        scheduleCategory = '식사';
      }
      // 숙박 관련 타입
      else if (types.some(type => 
        type.toLowerCase().includes('lodging') || 
        type.toLowerCase().includes('hotel') || 
        type.toLowerCase().includes('accommodation') ||
        type.toLowerCase().includes('guest_house') ||
        type.toLowerCase().includes('hostel')
      )) {
        scheduleCategory = '숙박';
      }
      // 쇼핑 관련 타입
      else if (types.some(type => 
        type.toLowerCase().includes('shopping') || 
        type.toLowerCase().includes('store') || 
        type.toLowerCase().includes('market') ||
        type.toLowerCase().includes('shopping_mall') ||
        type.toLowerCase().includes('department_store')
      )) {
        scheduleCategory = '쇼핑';
      }
      // 교통 관련 타입
      else if (types.some(type => 
        type.toLowerCase().includes('transit') || 
        type.toLowerCase().includes('station') || 
        type.toLowerCase().includes('airport') ||
        type.toLowerCase().includes('subway_station') ||
        type.toLowerCase().includes('bus_station')
      )) {
        scheduleCategory = '교통';
      }
    }
    
    navigate(`/schedule?place=${encodeURIComponent(placeName)}&date=${dateString}&category=${encodeURIComponent(scheduleCategory)}`)
  }

  if (!data) return <div className="p-8">{t('loading')}</div>

  const placeName = typeof data.displayName === 'object' ? data.displayName?.text : data.displayName ?? t('noName');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:pt-20">
      <TopBar />
      
      {/* 개별 뒤로가기 버튼 제거 (공통 FAB 사용) */}
      
  <div className="max-w-6xl mx-auto px-4 py-10">
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div>
        {/* Main Photo Section with Navigation */}
        {data.photos && data.photos.length > 0 && (
          <div className="relative mb-8">
            {/* Main Image Container */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <div 
                className="w-full h-[500px] md:h-[600px] cursor-pointer transition-transform duration-300 hover:scale-[1.02] flex items-center justify-center"
                onClick={() => {
                  setShowPhotoModal(true)
                  setCurrentPhotoIndex(currentImageIndex)
                }}
              >
                {(() => {
                  const photo = data.photos![currentImageIndex];
                  const photoEl = /^https?:\/\//.test(photo.name)
                    ? <img 
                        src={photo.name} 
                        alt={placeName} 
                        className="object-cover w-full h-full max-w-full max-h-full"
                        onLoad={() => {
                          // 이미지 로드 성공 시 캐시에 저장
                          sessionStorage.setItem(`place-photo:${data.id}`, JSON.stringify({
                            url: photo.name,
                            timestamp: Date.now()
                          }));
                        }}
                      />
                    : (() => {
                        const url = getApiUrl(`/v1/places/${encodeURIComponent(data.id)}/photos/media?name=${encodeURIComponent(photo.name)}&maxWidthPx=1200`);
                        return <img 
                          src={url} 
                          alt={placeName} 
                          className="object-cover w-full h-full"
                          onLoad={() => {
                            // 이미지 로드 성공 시 캐시에 저장
                            sessionStorage.setItem(`place-photo:${data.id}`, JSON.stringify({
                              url: url,
                              timestamp: Date.now()
                            }));
                          }}
                        />;
                      })();
                  
                  return photoEl;
                })()}
              </div>
              
              {/* Navigation Buttons */}
              {data.photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1 text-sm text-white bg-black/50 rounded-full backdrop-blur-sm">
                {currentImageIndex + 1}/{Math.min(data.photos.length, 5)}
              </div>
              
              {/* Action Buttons - Top Right */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleLike}
                  disabled={likedLoading}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm ${
                    liked 
                      ? 'bg-red-500/80 hover:bg-red-500 text-white' 
                      : 'bg-white/30 hover:bg-white/50 text-white'
                  } ${likedLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  onClick={handleAddToSchedule}
                  className="w-10 h-10 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
      </div>
            </div>
          </div>
        )}

        {/* 함께 보면 좋은 장소 섹션 제거 (원복) */}

        {/* (정리) 추가 데이터 섹션 제거로 간편화 */}

      </div>

      {/* 우측 요약 사이드바 */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{placeName}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                {typeof data.rating === 'number' && (
                  <>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      ★ {data.rating?.toFixed(1)}
                    </span>
                    {data.userRatingCount && (
                      <span className="text-gray-500 dark:text-gray-400">({data.userRatingCount} {t('reviews')})</span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* 영업 상태 */}
              {data.businessStatus && (
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      data.businessStatus === 'OPERATIONAL' ? 'bg-green-50 text-green-700 border-green-200' :
                      data.businessStatus === 'CLOSED_TEMPORARILY' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      data.businessStatus === 'CLOSED_PERMANENTLY' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {data.businessStatus === 'OPERATIONAL' ? t('businessStatus') :
                     data.businessStatus === 'CLOSED_TEMPORARILY' ? t('temporarilyClosed') :
                     data.businessStatus === 'CLOSED_PERMANENTLY' ? t('permanentlyClosed') : data.businessStatus}
                  </span>
                </div>
              )}

              {/* 주소 */}
              {data.formattedAddress && (
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  <span className="text-gray-700 dark:text-gray-300">{data.formattedAddress}</span>
                </div>
              )}

              {/* 전화 */}
              {data.formattedPhoneNumber && (
                <a href={`tel:${data.formattedPhoneNumber}`} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {data.formattedPhoneNumber}
                </a>
              )}

              {/* 웹사이트 */}
              {data.websiteUri && (
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  <a href={data.websiteUri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {data.websiteUri}
                  </a>
                </div>
              )}

              {/* 영업시간 */}
              {data.openingHours?.weekdayDescriptions && data.openingHours.weekdayDescriptions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('businessHours')}</div>
                  <div className="space-y-1 text-sm">
                    {data.openingHours.weekdayDescriptions.map((line: string, idx: number) => {
                      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                      const today = new Date().getDay();
                      // 더 정확한 매칭: 해당 요일로 시작하는지 확인
                      const isToday = line.startsWith(dayNames[today] + '요일') || line.startsWith(dayNames[today] + '일');
                  return (
                    <div key={idx} className={`${isToday ? 'text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                      {line}
                    </div>
                  );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t">
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    if (data.formattedAddress) {
                      navigator.clipboard?.writeText(data.formattedAddress).catch(() => {});
                    }
                  }}
                >
                  {t('copyAddress')}
                </button>
                <a
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm text-center"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  {t('viewOnMap')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    {/* Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {/* Header with rating (모바일/태블릿 전용) */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{placeName}</h1>
            <div className="flex items-center gap-2">
              <div className="rating rating-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <input
                    key={star}
                    type="radio"
                    name={`rating-${data.id}`}
                    className="bg-orange-400 mask mask-star-2"
                    checked={data.rating ? Math.round(data.rating) === star : false}
                    readOnly
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {data.rating?.toFixed(1) ?? '-'} ({data.userRatingCount?.toLocaleString() ?? 0} {t('reviews')})
              </span>
            </div>
          </div>

          {/* Business Status (모바일/태블릿 전용) */}
          {data.businessStatus && (
            <div className={`lg:hidden badge badge-outline ${
              data.businessStatus === 'OPERATIONAL' ? 'badge-error' : 
              data.businessStatus === 'CLOSED_TEMPORARILY' ? 'badge-warning' : 
              data.businessStatus === 'CLOSED_PERMANENTLY' ? 'badge-neutral' : ''
            }`}>
              {data.businessStatus === 'OPERATIONAL' ? t('businessStatus') : 
               data.businessStatus === 'CLOSED_TEMPORARILY' ? t('temporarilyClosed') : 
               data.businessStatus === 'CLOSED_PERMANENTLY' ? t('permanentlyClosed') : data.businessStatus}
            </div>
          )}
          
          {/* Address with Map Link (모바일/태블릿 전용) */}
          {data.formattedAddress && (
            <div className="lg:hidden flex items-center gap-2 mt-2">
              <span className="text-sm opacity-80 text-gray-700 dark:text-gray-300">📍 {data.formattedAddress}</span>
            </div>
          )}

          {/* Contact Info (모바일/태블릿 전용) */}
          <div className="lg:hidden flex flex-wrap gap-4 mt-4">
            {data.formattedPhoneNumber && (
              <a 
                href={`tel:${data.formattedPhoneNumber}`}
                className="flex items-center gap-2 text-sm link link-primary"
              >
                📞 {data.formattedPhoneNumber}
              </a>
            )}
            {data.websiteUri && (
              <a 
                href={data.websiteUri} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-sm link link-primary"
              >
                🌐 {t('website')}
              </a>
            )}
          </div>

          {/* 영업시간 (모바일/태블릿 전용) */}
          {data.openingHours?.weekdayDescriptions && data.openingHours.weekdayDescriptions.length > 0 && (
            <div className="lg:hidden mt-5">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('businessHours')}</div>
              <div className="space-y-1 text-sm">
                {data.openingHours.weekdayDescriptions.map((line: string, idx: number) => {
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  const today = new Date().getDay();
                  // 더 정확한 매칭: 해당 요일로 시작하는지 확인
                  const isToday = line.startsWith(dayNames[today] + '요일') || line.startsWith(dayNames[today] + '일');
                  return (
                    <div key={idx} className={`${isToday ? 'text-blue-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* Opening Hours (좌측 본문: 중복 방지 위해 삭제) */}

          {/* Price Level */}
          {data.priceLevel && (
            <div className="mt-2">
              <span className="text-sm opacity-80">{t('priceLevel')}: {'💰'.repeat(Number(data.priceLevel))}</span>
            </div>
          )}
          
          {/* Description */}
          {data.editorialSummary && (
            <div className="mt-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{t('description')}</h3>
              <p className="text-sm opacity-80 text-gray-700 dark:text-gray-300">
                {typeof data.editorialSummary === 'object' ? data.editorialSummary.text : data.editorialSummary}
              </p>
            </div>
          )}
          
           {/* Review Summary - 원래대로 전체 너비, 위아래만 슬림 */}
           {data.reviews && data.reviews.length > 0 && (
             <div className="p-4 mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
               <div className="mb-3">
                 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('googleReviews')}</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                   {t('totalReviews')} {data.userRatingCount?.toLocaleString() || 0}{t('reviews')}
                 </p>
               </div>

               <div className="flex items-center justify-center">
                 {/* Overall Rating */}
                 <div className="text-center">
                   <div className="mb-1 text-3xl font-bold text-gray-800 dark:text-gray-100">
                     {data.rating?.toFixed(1) || '0.0'}
                   </div>
                   <div className="flex justify-center mb-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                     ))}
                   </div>
                   <div className="text-sm text-gray-600 dark:text-white">
                     {t('reviews')} {data.userRatingCount?.toLocaleString() || 0}{t('reviews')}
                   </div>
                 </div>
               </div>
             </div>
           )}
          
          {/* Reviews - 기존 위치에 펼치기 버튼 */}
          {data.reviews && data.reviews.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('reviews')}</h2>
                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  {showReviews ? t('hideReviews') : t('viewReviews')}
                  <svg 
                    className={`w-4 h-4 transition-transform ${showReviews ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {showReviews && (
                <>
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          sortOption === 'relevance' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                        onClick={() => setSortOption('relevance')}
                      >
                        {t('relevanceOrder')}
                      </button>
                      <button
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          sortOption === 'latest' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                        onClick={() => setSortOption('latest')}
                      >
                        {t('latestOrder')}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                                {(() => {
                  let sortedReviews = [...data.reviews];
                  if (sortOption === 'latest') {
                    // 최신순 정렬 (publishTime 기준)
                    sortedReviews.sort((a, b) => {
                      const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0;
                      const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0;
                      return timeB - timeA;
                    });
                  } else {
                    // 관련성순 정렬 (별점 높은 순, 같으면 최신순)
                    sortedReviews.sort((a, b) => {
                      const ratingA = a.rating || 0;
                      const ratingB = b.rating || 0;
                      if (ratingB !== ratingA) return ratingB - ratingA;
                      
                      // 별점이 같으면 최신순으로 정렬
                      const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0;
                      const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0;
                      return timeB - timeA;
                    });
                  }
                  
                  return (
                    <>
                                            {sortedReviews.map((review, i) => (
                        <div key={i} className="p-4 border rounded-lg bg-base-50">
                      {/* Author Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {review.author?.displayName || review.authorAttribution?.displayName || 'Anonymous'}
                            </span>
                            {review.isLocalGuide && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {t('localGuide')}
                              </span>
                            )}
                          </div>
                          
                          {/* Author Stats */}
                          <div className="flex items-center gap-4 mb-2 text-xs text-gray-600 dark:text-white">
                            {review.reviewCount && (
                              <span>{t('reviews')} {review.reviewCount}{t('reviews')}</span>
                            )}
                            {review.photoCount && (
                              <span>{t('photos')} {review.photoCount}{t('photos')}</span>
                            )}
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="rating rating-xs">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <input
                                  key={star}
                                  type="radio"
                                  name={`review-rating-${i}`}
                                  className="bg-orange-400 mask mask-star-2"
                                  checked={review.rating === star}
                                  readOnly
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {review.rating?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Date */}
                        <div className="text-xs text-right text-gray-500 dark:text-gray-400">
                          {review.relativePublishTimeDescription}
                        </div>
                      </div>
                      
                      {/* Review Text */}
                      {(() => {
                        const reviewText = typeof review.text === 'object' ? review.text.text : review.text || '';
                        const isExpanded = expandedReviews.has(i);
                        const shouldTruncate = reviewText.length > 150;
                        const displayText = shouldTruncate && !isExpanded 
                          ? reviewText.substring(0, 150) + '...' 
                          : reviewText;
                        
                        return (
                          <div>
                            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                              {displayText}
                            </p>
                            {shouldTruncate && (
                              <button
                                className="mt-2 text-sm text-blue-600 transition-colors hover:text-blue-800"
                                onClick={() => {
                                  const newExpanded = new Set(expandedReviews);
                                  if (isExpanded) {
                                    newExpanded.delete(i);
                                  } else {
                                    newExpanded.add(i);
                                  }
                                  setExpandedReviews(newExpanded);
                                }}
                              >
                                {isExpanded ? '접기' : '더보기'}
                                                            </button>
                            )}
                          </div>
                        );
                      })()}
                        </div>
                      ))}
                      
                      {/* Google Places 링크 - 더 많은 리뷰와 사진 보기 */}
                      {sortedReviews.length > 0 && (
                        <div className="flex justify-center gap-4 mt-6">
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(placeName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            {t('viewMoreOnGoogleMaps')}
                          </a>
                          
                        </div>
                      )}
                    </>
                  );
                })()}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 주변 맛집 & 숙소 섹션 */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('nearbyRestaurants')}</h2>
            
            {loadingNearby ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-white">{t('loadingNearbyInfo')}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 맛집 */}
        {nearbyRestaurants.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
               {t('restaurants')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRestaurants.slice(0, displayedRestaurantCount).map((restaurant, index) => (
                <div 
                  key={`restaurant-${restaurant.contentid}-${index}`} 
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleTourItemClick(restaurant)}
                >
                          {restaurant.firstimage && (
                            <img
                              src={restaurant.firstimage}
                              alt={restaurant.title}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x150?text=No+Image';
                              }}
                            />
                          )}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {restaurant.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-white mb-2">
                        📍 {restaurant.addr1}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-600 font-medium">
                          📏 {calculateDistance(
                            data?.location.latitude || 0, 
                            data?.location.longitude || 0, 
                            parseFloat(restaurant.mapy), 
                            parseFloat(restaurant.mapx)
                          ).toFixed(1)}km
                        </p>
                        <p className="text-xs text-blue-500 font-medium">{t('viewDetail')}</p>
                      </div>
                      {restaurant.tel && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📞 {restaurant.tel}
                        </p>
                      )}
                      
                    </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 더 보기 버튼 */}
                    {allRestaurants.length > displayedRestaurantCount && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => {
                            if (process.env.NODE_ENV === 'development') {
                              console.log('🍜 맛집 더보기 버튼 클릭됨');
                            }
                            handleLoadMore('restaurants');
                          }}
                          disabled={loadingMore}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                        >
                          {loadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {t('loading')}
                            </>
                          ) : (
                            <>
                              {t('morePlaces')} ({allRestaurants.length - displayedRestaurantCount}{t('moreCount')})
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 숙소 */}
        {nearbyAccommodations.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
              {t('accommodations')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAccommodations.slice(0, displayedAccommodationCount).map((accommodation, index) => (
                        <div 
                          key={`accommodation-${accommodation.contentid}-${index}`} 
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
                          onClick={() => handleTourItemClick(accommodation)}
                        >
                          {accommodation.firstimage && (
                            <img
                              src={accommodation.firstimage}
                              alt={accommodation.title}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x150?text=No+Image';
                              }}
                            />
                          )}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {accommodation.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-white mb-2">
                        📍 {accommodation.addr1}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-600 font-medium">
                          📏 {calculateDistance(
                            data?.location.latitude || 0, 
                            data?.location.longitude || 0, 
                            parseFloat(accommodation.mapy), 
                            parseFloat(accommodation.mapx)
                          ).toFixed(1)}km
                        </p>
                        <p className="text-xs text-blue-500 font-medium">{t('viewDetail')}</p>
                      </div>
                      {accommodation.tel && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          📞 {accommodation.tel}
                        </p>
                      )}
                      
                    </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 더 보기 버튼 */}
                    {allAccommodations.length > displayedAccommodationCount && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => {
                            if (process.env.NODE_ENV === 'development') {
                              console.log('🏨 숙소 더보기 버튼 클릭됨');
                            }
                            handleLoadMore('accommodations');
                          }}
                          disabled={loadingMore}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                        >
                          {loadingMore ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {t('loading')}
                            </>
                          ) : (
                            <>
                              {t('morePlaces')} ({allAccommodations.length - displayedAccommodationCount}{t('moreCount')})
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {nearbyRestaurants.length === 0 && nearbyAccommodations.length === 0 && !loadingNearby && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>{t('noNearbyPlaces')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal - Google Style */}
      {showPhotoModal && data.photos && data.photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-4">
              <button
                className="p-2 text-white transition-colors rounded-full hover:bg-white/10"
                onClick={() => setShowPhotoModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-white">
                <div className="font-medium">{placeName}</div>
                <div className="text-sm text-gray-300 dark:text-gray-500">
                  {currentPhotoIndex + 1} / {data.photos.length}
                </div>
              </div>
            </div>
            <div className="text-sm text-white">
              저작권 보호를 받는 이미지일 수 있습니다.
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-full">
            {/* Left Sidebar - Thumbnails */}
            <div className="w-64 p-4 overflow-y-auto bg-gray-900">
              <div className="grid grid-cols-2 gap-2">
                {data.photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                      index === currentPhotoIndex 
                        ? 'border-blue-500 ring-2 ring-blue-500' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  >
                    {(() => {
                      const thumbnailEl = /^https?:\/\//.test(photo.name)
                        ? <img 
                            src={photo.name} 
                            alt={`썸네일 ${index + 1}`} 
                            className="object-cover w-full h-full"
                            onLoad={() => {
                              // 썸네일 이미지 로드 성공 시 캐시에 저장
                              sessionStorage.setItem(`place-photo:${data.id}`, JSON.stringify({
                                url: photo.name,
                                timestamp: Date.now()
                              }));
                            }}
                          />
                        : (() => {
                            const url = getApiUrl(`/v1/places/${encodeURIComponent(data.id)}/photos/media?name=${encodeURIComponent(photo.name)}&maxWidthPx=200`);
                            return <img 
                              src={url} 
                              alt={`썸네일 ${index + 1}`} 
                              className="object-cover w-full h-full"
                              onLoad={() => {
                                // 썸네일 이미지 로드 성공 시 캐시에 저장
                                sessionStorage.setItem(`place-photo:${data.id}`, JSON.stringify({
                                  url: url,
                                  timestamp: Date.now()
                                }));
                              }}
                            />;
                          })();
                      
                      return thumbnailEl;
                    })()}
                    
                    {/* Video indicator - removed for now */}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Image Area */}
            <div className="relative flex items-center justify-center flex-1">
              {/* Main Photo */}
              <div className="relative max-w-full max-h-full">
                {(() => {
                  const photo = data.photos![currentPhotoIndex];
                  const photoEl = /^https?:\/\//.test(photo.name)
                    ? <img 
                        src={photo.name} 
                        alt={`${placeName} ${currentPhotoIndex + 1}`} 
                        className="max-w-full max-h-[90vh] object-contain"
                        onLoad={() => {
                          // 모달 이미지 로드 성공 시 캐시에 저장
                          sessionStorage.setItem(`place-photo:${data.id}`, JSON.stringify({
                            url: photo.name,
                            timestamp: Date.now()
                          }));
                        }}
                      />
                    : (() => {
                        const url = getApiUrl(`/v1/places/${encodeURIComponent(data.id)}/photos/media?name=${encodeURIComponent(photo.name)}&maxWidthPx=1200`);
                        return <img 
                          src={url} 
                          alt={`${placeName} ${currentPhotoIndex + 1}`} 
                          className="max-w-full max-h-[90vh] object-contain"
                          onLoad={() => {
                            // 모달 이미지 로드 성공 시 캐시에 저장
                            sessionStorage.setItem(`place-photo:${data.id}`, JSON.stringify({
                              url: url,
                              timestamp: Date.now()
                            }));
                          }}
                        />;
                      })();
                  
                  return photoEl;
                })()}
              </div>

              {/* Navigation Arrows */}
              <button
                className="absolute p-3 text-white transition-colors transform -translate-y-1/2 rounded-full left-4 top-1/2 bg-black/50 hover:bg-black/70"
                onClick={() => setCurrentPhotoIndex(currentPhotoIndex === 0 ? data.photos!.length - 1 : currentPhotoIndex - 1)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute p-3 text-white transition-colors transform -translate-y-1/2 rounded-full right-4 top-1/2 bg-black/50 hover:bg-black/70"
                onClick={() => setCurrentPhotoIndex(currentPhotoIndex === data.photos!.length - 1 ? 0 : currentPhotoIndex + 1)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 날짜 선택 모달 */}
      <DateSelectModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onDateSelect={handleDateSelect}
        placeName={placeName}
      />

      {/* Tour Item Detail Modal */}
      <TourItemModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        tourItem={selectedTourItem}
      />
      
      <Footer />
      <FloatingActionButton />
    </div>
  )
}


