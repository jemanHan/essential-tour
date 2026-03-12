import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = { 
  title: string; 
  imageUrl: string; 
  rating?: number; 
  reviews?: number; 
  href?: string; 
  tag?: string; 
};

export default function PlaceCard({ title, imageUrl, rating, reviews, href = '#', tag }: Props) {
  const { t } = useTranslation();
  return (
    <a href={href} className="card hover:-translate-y-1 hover:shadow-lg transition border-2 border-gray-200 dark:border-gray-600 rounded-2xl">
      <div className="overflow-hidden rounded-2xl">
        {/* 이미지 영역 확대: 5/4 비율로 더 넓게 */}
        <img src={imageUrl} alt={title} className="aspect-[5/4] w-full object-cover" />
      </div>
      <div className="card-pad">
        {tag ? <span className="badge mb-3">{tag}</span> : null}
        {/* 텍스트 크기 소폭 축소, 가독성 유지 */}
        <h3 className="font-bold text-base md:text-lg">{title}</h3>
        {(rating !== undefined) ? (
          <div className="mt-1 flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400' 
                      : i < rating 
                        ? 'text-yellow-300' 
                        : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
              {rating.toFixed(1)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              • {reviews ?? 0} {t('reviews')}
            </span>
          </div>
        ) : null}
      </div>
    </a>
  );
}
