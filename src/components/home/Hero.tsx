import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchPlaces, photoUrl } from "../../lib/fetchers";

type Slide = { key: string; title: string; sub: string; bg?: string };

// 테마 데이터는 컴포넌트 내부에서 다국어로 생성

// 기본 배경 이미지 URL들 (API 호출 실패 시 사용)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop", // 자연
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&h=900&fit=crop", // 도심
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1600&h=900&fit=crop", // 역사
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&h=900&fit=crop", // 축제
];

export default function Hero() {
  const { t, i18n } = useTranslation();
  
  // 다국어 테마 데이터 생성
  const THEMES = [
    { key: "자연",  title: t('natureTitle'), sub: t('natureSub') },
    { key: "도심",  title: t('cityTitle'), sub: t('citySub') },
    { key: "역사",  title: t('historyTitle'), sub: t('historySub') },
    { key: "축제",  title: t('festivalTitle'), sub: t('festivalSub') },
  ];
  
  const [slides, setSlides] = useState<Slide[]>(THEMES.map((theme, idx) => ({
    ...theme,
    bg: FALLBACK_IMAGES[idx] // 초기 상태에서도 fallback 이미지 설정
  })));
  const [i, setI] = useState(0);
  const timer = useRef<number | null>(null);
  const hasLoaded = useRef<boolean>(false);
  const isMounted = useRef<boolean>(true);

  // 언어 변경 시 slides 업데이트
  useEffect(() => {
    const newThemes = [
      { key: "자연",  title: t('natureTitle'), sub: t('natureSub') },
      { key: "도심",  title: t('cityTitle'), sub: t('citySub') },
      { key: "역사",  title: t('historyTitle'), sub: t('historySub') },
      { key: "축제",  title: t('festivalTitle'), sub: t('festivalSub') },
    ];
    
    setSlides(prevSlides => {
      return newThemes.map((theme, idx) => ({
        ...theme,
        bg: prevSlides[idx]?.bg || FALLBACK_IMAGES[idx]
      }));
    });
  }, [i18n.language, t]);

  useEffect(() => {
    // 이미 로드된 경우 중복 실행 방지
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    (async () => {
      // fetch one photo per theme to use as background
      const withBg: Slide[] = [];
      for (let idx = 0; idx < THEMES.length; idx++) {
        const t = THEMES[idx];
        if (!isMounted.current) break; // 컴포넌트가 언마운트되면 중단
        
        try {
          // API 호출 제한: 한 번에 하나씩만 호출
          const list = await searchPlaces({ 
            q: t.key, 
            onlyTourism: true, 
            sort: "score", 
            limit: 1 
          });
          
          if (!isMounted.current) break;
          
          const p = list[0];
          let bg: string | undefined;
          
          if (p?.id && p?.photos?.[0]?.name) {
            bg = photoUrl(p.id, p.photos[0].name, 1600) || undefined;
          }
          
          // API에서 이미지를 가져오지 못한 경우 fallback 이미지 사용
          if (!bg) {
            bg = FALLBACK_IMAGES[idx];
          }
          
          withBg.push({ ...t, bg });
        } catch (error) {
          // API 호출 실패 시 fallback 이미지 사용
          if (isMounted.current) {
            withBg.push({ ...t, bg: FALLBACK_IMAGES[idx] });
          }
        }
      }
      
      if (isMounted.current && withBg.length > 0) {
        setSlides(withBg);
      }
    })();
    
    return () => {
      isMounted.current = false;
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  function go(n: number) {
    setI((prev) => (prev + n + slides.length) % slides.length);
    resetTimer();
  }
  
  function jump(idx: number) {
    setI(idx);
    resetTimer();
  }
  
  function resetTimer() {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => setI(v => (v + 1) % slides.length), 3500);
  }
  
  useEffect(() => { 
    resetTimer();
    return () => { 
      if (timer.current) window.clearInterval(timer.current); 
    }; 
  }, [slides.length]); // slides.length가 변경될 때만 재실행

  const s = slides[i];
  const style: any = s?.bg
    ? { 
        backgroundImage: `url(${s.bg})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }
    : { 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      };

  return (
    <div className="w-full">
      {/* 대형 배너 이미지 - 네비게이션과 겹치도록 */}
      <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden" style={style}>
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
        
        {/* 네비게이션 화살표 */}
        <button 
          aria-label="prev" 
          onClick={() => go(-1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          aria-label="next" 
          onClick={() => go(1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* 중앙 텍스트 콘텐츠 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-2xl">
              {s?.title}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 drop-shadow-lg max-w-2xl mx-auto">
              {s?.sub}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold rounded-full transition-all duration-200 border border-white/30">
                여행 계획하기
              </button>
              <button className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-full transition-all duration-200 shadow-lg">
                지금 시작하기
              </button>
            </div>
          </div>
        </div>

        {/* 하단 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, idx) => (
            <button 
              key={idx} 
              aria-label={`slide ${idx+1}`} 
              onClick={() => jump(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                idx === i 
                  ? "bg-white scale-110" 
                  : "bg-white/50 hover:bg-white/70"
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
