import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import { fetchNearbyPlaces } from '../lib/fetchers';

interface Place {
  id: string;
  displayName: {
    text: string;
  };
  rating?: number;
  userRatingCount?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos?: Array<{
    name: string;
  }>;
  types?: string[];
}

const NearbyRecommendationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const placeName = searchParams.get('placeName');

  const [recommendations, setRecommendations] = useState<{
    [category: string]: Place[];
  }>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [selectedRadius, setSelectedRadius] = useState(1000); // 1km 기본

  const categories = [
    { key: 'restaurant', name: '맛집', icon: '🍽️' },
    { key: 'cafe', name: '카페', icon: '☕' },
    { key: 'shopping', name: '쇼핑', icon: '🛍️' },
    { key: 'attraction', name: '관광지', icon: '🏛️' },
    { key: 'hotel', name: '숙박', icon: '🏨' },
    { key: 'transport', name: '교통', icon: '🚇' },
    { key: 'entertainment', name: '엔터테인먼트', icon: '🎬' },
    { key: 'health', name: '의료', icon: '🏥' }
  ];

  const radiusOptions = [
    { value: 100, label: '100m' },
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' }
  ];

  // 필수 파라미터가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!lat || !lng || !placeName) {
      navigate('/');
      return;
    }
  }, [lat, lng, placeName, navigate]);

  const fetchNearbyPlacesData = async (category: string) => {
    if (!lat || !lng) return;
    
    setLoading(prev => ({ ...prev, [category]: true }));
    
    try {
      const data = await fetchNearbyPlaces({
        lat: Number(lat),
        lng: Number(lng),
        category,
        radius: selectedRadius,
        limit: 8
      });
      
      setRecommendations(prev => ({
        ...prev,
        [category]: data as Place[]
      }));
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
    }
  };

  useEffect(() => {
    if (lat && lng) {
      // 초기 로딩 시 맛집과 카페 카테고리만 먼저 로드
      fetchNearbyPlacesData('restaurant');
      fetchNearbyPlacesData('cafe');
    }
  }, [lat, lng, selectedRadius]);

  const handleCategoryClick = (category: string) => {
    if (!recommendations[category] && !loading[category]) {
      fetchNearbyPlacesData(category);
    }
  };

  const handleBackToPlace = () => {
    window.close();
  };

  if (!lat || !lng || !placeName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">잘못된 접근</h2>
          <p className="text-gray-600">필요한 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🗺️ 주변 추천
              </h1>
              <p className="text-lg text-gray-600">
                <span className="font-semibold">{placeName}</span> 주변의 추천 장소들을 확인해보세요
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">반경:</span>
                <select
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {radiusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleBackToPlace}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← 장소로 돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => handleCategoryClick(category.key)}
              className={`px-6 py-3 rounded-lg text-base font-medium transition-colors ${
                recommendations[category.key] 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category.icon} {category.name}
              {loading[category.key] && <span className="ml-2">⏳</span>}
            </button>
          ))}
        </div>

        {/* 추천 장소 목록 */}
        <div className="space-y-8">
          {categories.map(category => {
            const places = recommendations[category.key] || [];
            if (places.length === 0 && !loading[category.key]) return null;

            return (
              <div key={category.key} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {category.icon} {category.name}
                  </h2>
                  {loading[category.key] && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      로딩 중...
                    </span>
                  )}
                </div>

                {loading[category.key] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                        <div className="bg-gray-200 h-5 rounded w-3/4 mb-2"></div>
                        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {places.map(place => (
                      <div
                        key={place.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
                      >
                        <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          {place.photos && place.photos.length > 0 ? (
                            place.photos[0].name.startsWith('mock-photo') ? (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                                <span className="text-5xl">🏪</span>
                              </div>
                            ) : (
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/v1/places/${place.id}/photos/media?name=${place.photos[0].name}&maxWidthPx=400`}
                                alt={place.displayName.text}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )
                          ) : (
                            <span className="text-gray-400 text-4xl">📷</span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 text-base mb-2 line-clamp-2">
                          {place.displayName.text}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {place.rating && (
                            <>
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-medium text-gray-700 dark:text-gray-200">{place.rating.toFixed(1)}</span>
                              {place.userRatingCount && (
                                <span className="text-gray-500">({place.userRatingCount})</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {places.length === 0 && !loading[category.key] && (
                  <p className="text-gray-500 text-center py-8 text-lg">
                    해당 반경 내에 추천 장소가 없습니다.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <FloatingActionButton />
    </div>
  );
};

export default NearbyRecommendationsPage;


