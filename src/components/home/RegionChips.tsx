import { memo } from "react";
import { useTranslation } from "react-i18next";

type Props = { onPick: (region: string) => void; current?: string };

const REGIONS = [
  "전국", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
];

export default memo(function RegionChips({ onPick, current="전국" }: Props) {
  const { t } = useTranslation();

  return (
    <section className="mb-6">
      {/* 반응형 그리드 - 화면 크기에 따라 컬럼 수 조정 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2 sm:gap-3 px-2 sm:px-4 py-2">
        {REGIONS.map(region => {
          const active = (current || "전국") === region;
          return (
            <button
              key={region}
              onClick={() => onPick(region)}
              className={`
                relative px-2 sm:px-3 md:px-4 py-2 rounded-full border-2 
                whitespace-nowrap transition-all duration-300 font-medium 
                text-xs sm:text-sm overflow-hidden group
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
              {active && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* 스크롤 힌트 (모바일에서) */}
      <div className="flex justify-center mt-2 sm:hidden">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </section>
  );
});
