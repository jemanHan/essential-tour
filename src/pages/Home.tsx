import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import TopBar from "../components/layout/TopBar";
import Footer from "../components/layout/Footer";
import Hero from "../components/common/Hero";
import PlaceCard from "../components/cards/PlaceCard";
import RegionChipsEnhanced from "../components/home/RegionChipsEnhanced";
import PlaceGrid from "../components/home/PlaceGrid";
import { PlaceLite, searchPlaces } from "../lib/fetchers";
import { preloadStrategies, getCachedData } from "../lib/preloader";

const MIN_RATING = Number(import.meta.env.VITE_MIN_RATING ?? 3.0);
const MIN_REVIEWS = Number(import.meta.env.VITE_MIN_REVIEWS ?? 5);

export default function Home() {
  const { t } = useTranslation();
  const [region, setRegion] = useState<string>("전국");
  const [items, setItems] = useState<PlaceLite[]>([]);
  const [loading, setLoading] = useState(false); // 초기 로딩 상태를 false로 시작
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const location = useLocation();
  const urlQuery = useMemo(() => new URLSearchParams(location.search).get("q") ?? "", [location.search]);

  // 지역 선택 유지: sessionStorage에서 복원
  useEffect(() => {
    try {
      const savedRegion = sessionStorage.getItem('home_selected_region');
      if (savedRegion && savedRegion !== region) {
        setRegion(savedRegion);
      }
    } catch {}
  // 초기 마운트 시 1회 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 지역 변경 시 sessionStorage에 저장
  useEffect(() => {
    try {
      sessionStorage.setItem('home_selected_region', region);
    } catch {}
  }, [region]);

  // 디바운스 및 중복 요청 취소 처리
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadRecommended = async () => {
    // 캐시된 데이터 먼저 확인
    const cacheKey = `home_${region}_${urlQuery}_${i18n.language}`;
    const cachedData = getCachedData(cacheKey, 900000); // 15분 캐시
    
    if (cachedData) {
      setItems((cachedData as any).data || []);
      setPagination((cachedData as any).pagination || null);
      setLoading(false);
      return;
    }

    // 캐시가 없을 때만 로딩 상태 표시
    setLoading(true);

    // 이전 디바운스 타이머 클리어
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // 50ms 디바운스 (더 빠른 응답)
    debounceRef.current = window.setTimeout(async () => {
      // 이전 요청 취소
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch {}
      }
      const controller = new AbortController();
      abortRef.current = controller;

      // setLoading(true); // 이미 위에서 설정됨
      try {
        const lang = i18n.language.split('-')[0];
        const baseParams = {
          q: urlQuery || undefined,
          region: region === "전국" ? undefined : region,
          minRating: MIN_RATING,
          minReviews: MIN_REVIEWS,
          sort: "score",
          onlyTourism: true,
          page: currentPage,
          limit: 8,
          language: lang
        } as const;

        // API 호출 (적절한 타임아웃)
        const result = await searchPlaces(baseParams);
        
        let list = ((result as any).data || []) as PlaceLite[];
        let pageInfo = (result as any).pagination;
        
        // 페이지네이션 최적화는 필터링 후에 처리
        
        // 개발 환경에서만 디버깅 로그 표시
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${region}] Loading page ${currentPage}:`, {
            currentPage,
            totalPages: pageInfo?.totalPages,
            hasNext: pageInfo?.hasNext,
            totalItems: pageInfo?.totalItems,
            itemsInPage: list.length,
            apiCalls: 1
          });
        }

        // 언어 스크립트 기준 필터링 + 백필
        const hasKorean = (s: string) => /[\u3131-\u318F\uAC00-\uD7A3]/.test(s);
        const getName = (it: PlaceLite) => it.displayName?.text || '';
        const matches = (name: string) => {
          if (!name) return false;
          if (lang === 'en') return !hasKorean(name);
          if (lang === 'ko') return hasKorean(name);
          return true;
        };

        // Google API 정보가 있는지 확인하는 함수
        const hasGoogleApiData = (item: PlaceLite) => {
          // PlaceLite 타입에는 id 필드만 있음
          const hasId = !!(item.id && item.id.trim() !== '');
          
          // 개발 환경에서만 디버깅 로그 표시
          if (process.env.NODE_ENV === 'development') {
            console.log('[DEBUG] First item structure:', {
              id: item.id,
              displayName: item.displayName,
              keys: Object.keys(item)
            });
          }
          
          return hasId;
        };

        let filtered = list.filter(it => {
          const nameMatch = matches(getName(it));
          // 영어 환경에서는 기본적으로 이름 매칭만 확인
          // Google API 정보는 선택적 (모든 아이템이 id를 가지고 있어야 함)
          if (lang === 'en') {
            return nameMatch; // 일단 이름 매칭만 확인
          }
          return nameMatch;
        });

        // 개발 환경에서만 디버깅 로그 표시
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${region}] Initial filtering: ${list.length} -> ${filtered.length} (lang: ${lang})`);
        }
        
        // 영어 환경에서 상세 디버깅
        if (lang === 'en') {
          const withGoogleApi = list.filter(it => hasGoogleApiData(it)).length;
          const koreanNames = list.filter(it => hasKorean(getName(it))).length;
          const englishNames = list.filter(it => !hasKorean(getName(it))).length;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[${region}] Items with Google API: ${withGoogleApi}/${list.length}`);
            console.log(`[${region}] Korean names: ${koreanNames}, English names: ${englishNames}`);
            
            // 첫 번째 아이템의 이름 확인
            if (list.length > 0) {
              console.log(`[${region}] First item name: "${getName(list[0])}" (hasKorean: ${hasKorean(getName(list[0]))})`);
            }
          }
        }

        // 초기 로딩 시에는 추가 페이지 로드하지 않음 (성능 최적화)
        let totalConsumedPages = 1; // 현재 페이지만 사용
        
        // 페이지네이션 최적화: 다음 1-2페이지 미리 로드 (초기 로딩 시에만)
        if (pageInfo?.hasNext && currentPage === 1 && filtered.length >= 8) {
          // 백그라운드에서 다음 페이지들 미리 로드
          setTimeout(() => {
            const nextPageParams = { ...baseParams, page: 2 };
            const nextNextPageParams = { ...baseParams, page: 3 };
            
            // 다음 페이지 로드
            searchPlaces(nextPageParams).catch(() => {});
            
            // 다다음 페이지도 로드 (총 2페이지까지)
            if (pageInfo.totalPages > 2) {
              searchPlaces(nextNextPageParams).catch(() => {});
            }
          }, 1000); // 1초 후 백그라운드 로드 (초기 로딩 완료 후)
        }

        // 개발 환경에서만 디버깅 로그 표시
        if (process.env.NODE_ENV === 'development') {
          const totalApiCalls = totalConsumedPages;
          console.log(`[${region}] Final result: ${filtered.length} items from ${totalConsumedPages} pages (API calls: ${totalApiCalls})`);
        }

        // 최종 세팅: 부족하면 원본 섞어서 최소 노출 보장
        if (filtered.length < 8) {
          const filler = list.filter(it => !filtered.includes(it)).slice(0, 8 - filtered.length);
          filtered = [...filtered, ...filler];
        }

        // 페이지네이션 정보: 원본 정보 그대로 유지 (단순화)
        const adjustedPageInfo = {
          ...pageInfo,
          currentPage: currentPage,
          // 원본 페이지 정보 그대로 사용
          totalPages: pageInfo?.totalPages || 1,
          hasNext: pageInfo?.hasNext || false,
          totalItems: pageInfo?.totalItems || filtered.length
        };

        setItems(filtered);
        setPagination(adjustedPageInfo);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    }, 100); // 100ms (적절한 디바운스)
  };

  useEffect(() => {
    void loadRecommended();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch {}
      }
    };
  }, [region, urlQuery, currentPage, i18n.language]);

  // 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [region, urlQuery]);

  const handlePageChange = useCallback((page: number) => {
    // 개발 환경에서만 디버깅 로그 표시
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${region}] Page change requested: ${currentPage} -> ${page}`);
    }
    setCurrentPage(page);
  }, [region, currentPage]);

  const handleRegionChange = useCallback((newRegion: string) => {
    // 즉시 로딩 상태 표시
    setLoading(true);
    setRegion(newRegion);
  }, []);

  return (
    <>
      <TopBar />
      {/* Hero 배너 - 네비게이션과 겹치도록 */}
      <Hero 
        title={t('nationwideTitle')}
        subtitle={t('nationwideSubtitle')}
        imageUrl="/hero-banner.jpg"
      />
      
      {/* 메인 콘텐츠 */}
      <main className="section dark:bg-gray-900">
        <div className="container-xl">
          <RegionChipsEnhanced current={region} onPick={handleRegionChange} />
          
          
          {/* 인기 여행지 섹션 */}
          <div className="mb-6">
            <h2 className="section-title">{t('popularDestinations')}</h2>
            <p className="section-sub">{t('nationwideDescription')}</p>
          </div>
        {loading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_,i)=>
                <div key={i} className="card h-48 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg">
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          : (
            <>
              <PlaceGrid items={items} />
              
              {/* 페이지네이션 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-12">
                  <button 
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                      !pagination.hasPrev 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    disabled={!pagination.hasPrev}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {t('previous')}
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2);
                      const pageNum = startPage + i;
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          className={`px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                            currentPage === pageNum 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                      !pagination.hasNext 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    disabled={!pagination.hasNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    {t('next')}
                  </button>
                  
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      
      <Footer />
    </>
  );
}