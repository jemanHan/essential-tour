import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { photoUrl } from "../../lib/fetchers";
import { useTranslation } from "react-i18next";

type Item = {
  id: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string }[];
};

// 간단 인메모리 이름 캐시 (언어별 분리)
const nameCacheGlobal: Record<string, Record<string, string>> = {};

export default memo(function PlaceGrid({ items }: { items: Item[] }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];
  const [localizedNames, setLocalizedNames] = useState<Record<string, string>>(() => {
    return nameCacheGlobal[currentLang] || {};
  });
  const abortRef = useRef<AbortController | null>(null);
  const concurrency = 4;
  
  // 언어 변경 시 캐시 스냅샷 로드
  useEffect(() => {
    setLocalizedNames(nameCacheGlobal[currentLang] || {});
  }, [currentLang]);
  
  // 상위 N개(12개)만 상세명 보정 시도 (과다 호출 방지)
  const topItems = useMemo(() => items.slice(0, 12), [items]);
  
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    const lang = currentLang;
    const existing = nameCacheGlobal[lang] || (nameCacheGlobal[lang] = {});
    const targets = topItems
      .map(p => p.id)
      .filter(id => !existing[id]);
    if (targets.length === 0) return;
    
    const queue = targets.slice();
    const workers: Promise<void>[] = [];
    const run = async () => {
      while (queue.length && !controller.signal.aborted) {
        const id = queue.shift()!;
        try {
          const res = await fetch(`/api/v1/places/${encodeURIComponent(id)}?language=${lang}`, {
            headers: { 'Accept-Language': lang },
            signal: controller.signal
          });
          if (!res.ok) continue;
          const json = await res.json();
          const name = json?.displayName?.text || json?.displayName || '';
          if (name) {
            existing[id] = name;
          }
        } catch {}
      }
    };
    for (let i = 0; i < Math.min(concurrency, queue.length); i++) workers.push(run());
    Promise.allSettled(workers).then(() => {
      if (!controller.signal.aborted) {
        setLocalizedNames({ ...existing });
      }
    });
    return () => controller.abort();
  }, [topItems, currentLang]);
  
  // Language-aware fallback chain for place names
  const getPlaceName = (item: Item) => {
    // 1) 상세 보정 캐시에 있으면 우선 사용
    const cached = localizedNames[item.id];
    if (cached) return cached;
    // 2) 리스트 기본 displayName
    if (item.displayName?.text) return item.displayName.text;
    // 3) 폴백
    return currentLang === 'en' ? 'No Name' : '이름 없음';
  };

  // 언어별 스크립트 매칭 필터: en 모드에서는 한글 포함시 숨김, ko 모드에서는 한글 미포함이면 숨김
  const hasKorean = (s: string) => /[\u3131-\u318F\uAC00-\uD7A3]/.test(s);
  const matchesSelectedLanguage = (name: string) => {
    if (!name) return false;
    if (currentLang === 'en') return !hasKorean(name);
    if (currentLang === 'ko') return hasKorean(name);
    return true;
  };

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((p, index) => {
          const src = photoUrl(p.id, p.photos?.[0]?.name, 600); // 800 -> 600으로 최적화
          const placeName = getPlaceName(p);
          const noImageText = currentLang === 'en' ? 'No Image' : '이미지 없음';
          // 언어 미스매치 항목 숨김 처리
          if (!matchesSelectedLanguage(placeName)) {
            return null;
          }
          
          return (
          <Link 
              key={p.id} 
              to={`/places/${encodeURIComponent(p.id)}`}
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 border-2 border-gray-200 dark:border-gray-600 rounded-2xl"
            >
              <figure className="w-full aspect-[4/3] overflow-hidden">
                {src ? (
                  <img 
                    src={src} 
                    alt={placeName} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    loading={index < 4 ? "eager" : "lazy"} // 첫 4개는 즉시 로딩
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{noImageText}</span>
                  </div>
                )}
              </figure>
              <div className="card-body p-3 text-center border-t border-gray-200 dark:border-gray-700">
                <h3 className="card-title text-sm md:text-base font-semibold line-clamp-2 mb-0 text-center">
                  {placeName}
                </h3>
                <div className="flex items-center justify-center">
                  <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1 text-center mx-auto">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium text-gray-800">{p.rating ?? "-"}</span>
                    <span className="text-gray-400 dark:text-gray-500">({p.userRatingCount ?? 0})</span>
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
});
