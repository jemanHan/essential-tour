import { memo, useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

type Props = { onPick: (region: string) => void; current?: string };

const REGIONS = [
  "전국", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];

export default memo(function RegionChipsEnhanced({ onPick, current="전국" }: Props) {
  const { t } = useTranslation();
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // 스크롤 가능 여부 체크
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowScrollHint(scrollWidth > clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  // 드래그 스크롤 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
    scrollRef.current.style.userSelect = 'auto';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
    scrollRef.current.style.userSelect = 'auto';
  }, []);

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    startX.current = e.touches[0].pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  return (
    <section className="mb-6">
      {/* 데스크톱: 그리드 레이아웃 */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-6 xl:grid-cols-9 gap-3 px-4 py-2">
          {REGIONS.map(region => {
            const active = (current || "전국") === region;
            return (
              <button
                key={region}
                onClick={() => onPick(region)}
                className={`
                  relative px-4 py-2 rounded-full border-2 
                  whitespace-nowrap transition-all duration-300 font-medium 
                  text-sm overflow-hidden group
                  ${active 
                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/60 transform scale-105 ring-2 ring-blue-200/50" 
                    : "bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-200 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-slate-700/50 hover:transform hover:scale-105 text-gray-700 dark:text-slate-300"
                  }
                `}
              >
                {/* 활성 상태일 때 빛나는 효과 */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
                )}
                
                {/* 호버 시 빛나는 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                
                {/* 텍스트 */}
                <span className="relative z-10 block truncate">
                  {t(`region.${region}`)}
                </span>
                
                {/* 활성 상태일 때 체크 아이콘 */}
              </button>
            );
          })}
        </div>
      </div>

      {/* 태블릿: 그리드 레이아웃 */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2">
          {REGIONS.map(region => {
            const active = (current || "전국") === region;
            return (
              <button
                key={region}
                onClick={() => onPick(region)}
                className={`
                  relative px-3 py-2 rounded-full border-2 
                  whitespace-nowrap transition-all duration-300 font-medium 
                  text-sm overflow-hidden group
                  ${active 
                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/60 transform scale-105 ring-2 ring-blue-200/50" 
                    : "bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-200 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-slate-700/50 hover:transform hover:scale-105 text-gray-700 dark:text-slate-300"
                  }
                `}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                <span className="relative z-10 block truncate">
                  {t(`region.${region}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 모바일: 스크롤 가능한 수평 리스트 */}
      <div className="block md:hidden">
        <div 
          ref={scrollRef}
          className={`flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing ${
            showAllRegions ? 'flex-wrap' : ''
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {REGIONS.map(region => {
            const active = (current || "전국") === region;
            return (
              <button
                key={region}
                onClick={() => onPick(region)}
                className={`
                  relative ${showAllRegions ? 'flex-shrink-0' : 'flex-shrink-0'} px-4 py-2 rounded-full border-2 
                  whitespace-nowrap transition-all duration-300 font-medium 
                  text-sm overflow-hidden group
                  ${active 
                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/60 transform scale-105 ring-2 ring-blue-200/50" 
                    : "bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-200 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-slate-700/50 hover:transform hover:scale-105 text-gray-700 dark:text-slate-300"
                  }
                `}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                <span className="relative z-10 block">
                  {t(`region.${region}`)}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* 목록 펼치기/접기 버튼 */}
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setShowAllRegions(!showAllRegions)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            {showAllRegions ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {t('collapseList')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {t('expandList')}
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
});
