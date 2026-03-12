import React, { useState, useEffect, useRef, useCallback } from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  className?: string;
}

export default function Hero({ title, subtitle, imageUrl, className = '' }: HeroProps) {
  const [heroImages, setHeroImages] = useState<string[]>([
    '/hero/n서울.jpg',
    '/hero/경복궁.jpg',
    '/hero/여행사진.jpg'
  ]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // manifest에서 동적 로드
  useEffect(() => {
    fetch('/hero/manifest.json')
      .then(r => r.json())
      .then((list: string[]) => {
        if (Array.isArray(list) && list.length > 0) {
          const withPrefix = list.map(name => `/hero/${name}`);
          setHeroImages(withPrefix);
        }
      })
      .catch(() => {});
  }, []);

  const startRotation = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % (heroImages.length || 1));
    }, 8000); // 8초 주기
  }, [heroImages.length]);

  useEffect(() => {
    startRotation();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [startRotation]);

  return (
    <div className={`relative min-h-[60vh] md:min-h-[80vh] overflow-hidden ${className}`}>
      {/* 로테이션 배경 이미지들 */}
      {heroImages.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${img})`, backgroundPosition: 'center 60%' }}
        />
      ))}
      
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />
      
      {/* 텍스트 - 좌측 하단 (통일: 흰 텍스트) */}
      <div className="relative z-10 container-xl flex min-h-[60vh] md:min-h-[80vh] items-end pb-8 md:pb-12">
        <div className="max-w-2xl">
          <h1 className={`text-white text-4xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-lg mb-2`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-white text-lg md:text-xl drop-shadow-md`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
