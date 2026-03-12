import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clearToken, isAuthenticated } from '../api/auth';
import { getMe, updateProfile, changePassword, deleteAccount, Me } from '../api/users';
import { getLikes, LikeData } from '../api/likes';
import { getRecentViews, RecentViewData } from '../api/recentViews';
import { photoUrl, placePhotoUrl } from '../lib/fetchers';
import TopBar from '../components/layout/TopBar';
import CalendarBoard from '../components/calendar/CalendarBoard';
import FloatingActionButton from '../components/layout/FloatingActionButton';

export default function MyPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [lang, setLang] = useState<'KR' | 'EN'>('KR');
  
  // 좋아요/최근 본 장소 상태
  const [likedPlaces, setLikedPlaces] = useState<LikeData[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<RecentViewData[]>([]);
  // 최근 본 모달 제거 요구사항 반영: 상태 제거
  const [likedSort, setLikedSort] = useState<'recent' | 'name'>('recent');
  const [recentSort, setRecentSort] = useState<'recent' | 'name'>('recent');
  
  // 페이지네이션 상태
  const [likedPage, setLikedPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [likedTotalPages, setLikedTotalPages] = useState(1);
  const [recentTotalPages, setRecentTotalPages] = useState(1);
  const [likedLoading, setLikedLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);

  // 페이지 캐시 (페이지 → 데이터)
  const [likedPagesCache, setLikedPagesCache] = useState<Record<number, LikeData[]>>({});
  const [recentPagesCache, setRecentPagesCache] = useState<Record<number, RecentViewData[]>>({});

  // 언어별 표시명을 위한 캐시
  const [nameCache, setNameCache] = useState<Record<string, string>>({});

  // 페이지 윈도우(최대 3개 번호) 계산
  const getWindowPages = (current: number, total: number): number[] => {
    const safeTotal = Math.max(total, 1);
    if (safeTotal <= 3) return Array.from({ length: safeTotal }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(current - 1, safeTotal - 2));
    return [start, start + 1, start + 2];
  };

  // 모달 상태
  const [displayNameModalOpen, setDisplayNameModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vk_token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      try {
        const data = await getMe();
        setMe(data);
        setDisplayName(data.displayName ?? '');
        setLang((data.lang as 'KR' | 'EN') ?? 'KR');
        
        // 최근 본 장소도 페이지네이션으로 로드 (1-2페이지 미리 로드)
        try {
          const [recentResponse1, recentResponse2] = await Promise.all([
            getRecentViews(1, 4),
            getRecentViews(2, 4).catch(() => ({ data: [], pagination: { totalPages: 1 } }))
          ]);
          
          const page1Recent = recentResponse1.data || [];
          const page2Recent = recentResponse2.data || [];
          setRecentPagesCache(prev => ({ ...prev, 1: page1Recent, ...(page2Recent.length ? { 2: page2Recent } : {}) }));
          // 초기 표시: 1페이지
          setRecentPlaces(page1Recent);
          setRecentPage(1);
          setRecentTotalPages(recentResponse1.pagination?.totalPages || 1);
          
          // 언어별 이름 보정: placeId 상세 API 호출 최소화 (동시성 제한 + 캐시)
          try {
            const lang = (localStorage.getItem('i18nextLng') || i18n.language || 'ko').split('-')[0];
            const ids = Array.from(new Set([...page1Recent, ...page2Recent].map((p:any)=>p.placeId))).filter((id)=>!nameCache[id]);
            const limit = 4; // 동시성 제한
            const queue = ids.slice();
            const next: Record<string, string> = {};
            const workers: Promise<void>[] = [];
            const run = async () => {
              while (queue.length) {
                const id = queue.shift()!;
                try {
                  const res = await fetch(`/api/v1/places/${encodeURIComponent(id)}?language=${lang}`, { headers: { 'Accept-Language': lang } });
                  const json = await res.json();
                  const display = json?.displayName?.text || json?.displayName || '';
                  if (display) next[id] = display;
                } catch {}
              }
            };
            for (let i=0;i<Math.min(limit, queue.length);i++) workers.push(run());
            await Promise.allSettled(workers);
            if (Object.keys(next).length) setNameCache(prev => ({ ...prev, ...next }));
          } catch {}
        } catch (error) {
          console.error('Failed to load recent views:', error);
          setRecentPlaces([]);
        }
        
        // 좋아요는 페이지네이션으로 로드 (1-2페이지 미리 로드)
        try {
          const [likesResponse1, likesResponse2] = await Promise.all([
            getLikes(1, 4),
            getLikes(2, 4).catch(() => ({ data: [], pagination: { totalPages: 1 } }))
          ]);
          
          const page1Likes = likesResponse1.data || [];
          const page2Likes = likesResponse2.data || [];
          setLikedPagesCache(prev => ({ ...prev, 1: page1Likes, ...(page2Likes.length ? { 2: page2Likes } : {}) }));
          // 초기 표시: 1페이지
          setLikedPlaces(page1Likes);
          setLikedPage(1);
          setLikedTotalPages(likesResponse1.pagination?.totalPages || 1);
          
          // 좋아요 목록도 현재 언어로 표시명 보정 (동시성 제한 + 캐시)
          try {
            const lang = (localStorage.getItem('i18nextLng') || i18n.language || 'ko').split('-')[0];
            const ids = Array.from(new Set([...page1Likes, ...page2Likes].map((p:any)=>p.placeId))).filter((id)=>!nameCache[id]);
            const limit = 4; // 동시성 제한
            const queue = ids.slice();
            const next: Record<string, string> = {};
            const workers: Promise<void>[] = [];
            const run = async () => {
              while (queue.length) {
                const id = queue.shift()!;
                try {
                  const res = await fetch(`/api/v1/places/${encodeURIComponent(id)}?language=${lang}`, { headers: { 'Accept-Language': lang } });
                  const json = await res.json();
                  const display = json?.displayName?.text || json?.displayName || '';
                  if (display) next[id] = display;
                } catch {}
              }
            };
            for (let i=0;i<Math.min(limit, queue.length);i++) workers.push(run());
            await Promise.allSettled(workers);
            if (Object.keys(next).length) setNameCache(prev => ({ ...prev, ...next }));
          } catch {}
        } catch (error) {
          console.error('Failed to load likes:', error);
          setLikedPlaces([]);
        }
      } catch (e: any) {
        // 401 → token invalid/expired
        clearToken();
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, i18n.language]);

  

  const handleDateClick = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    navigate(`/schedule?date=${yyyy}-${mm}-${dd}`);
  };

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile({ displayName, lang });
      setMe(updatedUser);
      setDisplayNameModalOpen(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
        return;
      }
    if (newPassword.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      
    setPwSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordModalOpen(false);
      alert('비밀번호가 변경되었습니다.');
    } catch (error: any) {
      alert(error.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPwSaving(false);
    }
  }


  // 장소 카드 렌더링 함수
  const renderPlaceCard = (place: LikeData | RecentViewData, onRemove?: (id: string) => void) => {
    const cachedName = nameCache[place.placeId];
    const name = cachedName || place.name || t('noName') || '이름 없음';
    
    // 새로운 Google Places API v1을 사용한 이미지 로딩
    const imageSrc = placePhotoUrl(place.placeId);
    const noImageText = i18n.language.startsWith('en') ? 'No Image' : '이미지 없음';
    
    return (
      <div
        key={place.placeId}
        className="group cursor-pointer w-full rounded-2xl border-2 border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => navigate(`/places/${encodeURIComponent(place.placeId)}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigate(`/places/${encodeURIComponent(place.placeId)}`);
        }}
      >
        <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden bg-gray-100">
          <img 
            src={imageSrc} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // 이미지 로드 실패 시 placeholder 표시
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center';
                fallback.innerHTML = `<span class="text-gray-500 text-sm">${noImageText}</span>`;
                parent.appendChild(fallback);
              }
            }}
            onLoad={(e) => {
              // 이미지 로드 성공 시 로딩 상태 제거
              const target = e.target as HTMLImageElement;
              const parent = target.parentElement;
              if (parent) {
                const loadingDiv = parent.querySelector('.loading-placeholder');
                if (loadingDiv) {
                  loadingDiv.remove();
                }
              }
            }}
          />
          {/* 로딩 상태 표시 */}
          <div className="loading-placeholder absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          </div>
          {onRemove && (
            <button
              className="absolute top-3 right-3 bg-white/85 dark:bg-gray-800/85 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-red-600 rounded-full w-10 h-10 flex items-center justify-center shadow text-lg"
              onClick={(e) => { e.stopPropagation(); onRemove(place.placeId); }}
              aria-label="제거"
            >
              ✕
            </button>
          )}
        </div>
        <div className="mt-2 mb-0 text-sm font-medium text-gray-900 dark:text-gray-100 text-center truncate">
          {name}
        </div>
      </div>
    );
  };

  // 제거 함수들
  const removeLiked = async (placeId: string) => {
    try {
      await import('../api/likes').then(api => api.removeLike(placeId));
      setLikedPlaces(prev => prev.filter(p => p.placeId !== placeId));
    } catch (error) {
      console.error('Failed to remove like:', error);
    }
  };

  const removeRecent = async (placeId: string) => {
    try {
      await import('../api/recentViews').then(api => api.removeRecentView(placeId));
      setRecentPlaces(prev => prev.filter(p => p.placeId !== placeId));
    } catch (error) {
      console.error('Failed to remove recent view:', error);
    }
  };

  // 페이지네이션 함수들 (번호 클릭 시 해당 페이지로 이동, 캐시 사용 + 프리패치)
  const prefetchLikedPages = (basePage: number, totalPages: number) => {
    [basePage + 1, basePage + 2].forEach(async (p) => {
      if (p <= totalPages && !likedPagesCache[p]) {
        try {
          const res = await getLikes(p, 4);
          setLikedPagesCache(prev => ({ ...prev, [p]: res.data || [] }));
        } catch {}
      }
    });
  };

  const prefetchRecentPages = (basePage: number, totalPages: number) => {
    [basePage + 1, basePage + 2].forEach(async (p) => {
      if (p <= totalPages && !recentPagesCache[p]) {
        try {
          const res = await getRecentViews(p, 4);
          setRecentPagesCache(prev => ({ ...prev, [p]: res.data || [] }));
        } catch {}
      }
    });
  };

  const loadLikedPage = async (page: number) => {
    if (likedLoading || page === likedPage) return;
    // 캐시 우선
    if (likedPagesCache[page]) {
      setLikedPlaces(likedPagesCache[page]);
      setLikedPage(page);
      prefetchLikedPages(page, likedTotalPages);
      return;
    }
    setLikedLoading(true);
    try {
      const response = await getLikes(page, 4);
      const list = response.data || [];
      setLikedPagesCache(prev => ({ ...prev, [page]: list }));
      setLikedPlaces(list);
      setLikedPage(page);
      setLikedTotalPages(response.pagination?.totalPages || likedTotalPages);
      prefetchLikedPages(page, response.pagination?.totalPages || likedTotalPages);
    } catch (error) {
      console.error('Failed to load liked page:', error);
    } finally {
      setLikedLoading(false);
    }
  };

  const loadRecentPage = async (page: number) => {
    if (recentLoading || page === recentPage) return;
    if (recentPagesCache[page]) {
      setRecentPlaces(recentPagesCache[page]);
      setRecentPage(page);
      prefetchRecentPages(page, recentTotalPages);
      return;
    }
    setRecentLoading(true);
    try {
      const response = await getRecentViews(page, 4);
      const list = response.data || [];
      setRecentPagesCache(prev => ({ ...prev, [page]: list }));
      setRecentPlaces(list);
      setRecentPage(page);
      setRecentTotalPages(response.pagination?.totalPages || recentTotalPages);
      prefetchRecentPages(page, response.pagination?.totalPages || recentTotalPages);
    } catch (error) {
      console.error('Failed to load recent page:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  // 초기 마운트 후 1페이지 기준 프리패치
  useEffect(() => {
    if (!loading) {
      prefetchLikedPages(1, likedTotalPages);
      prefetchRecentPages(1, recentTotalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!me) return null;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pt-16 md:pt-20">
      <TopBar />
      
      {/* 페이지 제목 */}
      <div className="flex justify-between items-center mb-6 mt-6 px-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{t('mypage')}</h1>
      </div>
      
      {/* 좌: 좋아요/최근 본, 우: 프로필 + 미니 달력 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_384px] gap-6 px-6 pb-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* 좋아요한 장소 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg max-w-full overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('likedPlaces') || '좋아요한 여행지'}</h2>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => loadLikedPage(Math.max(1, likedPage - 1))}
                  disabled={likedLoading || likedPage <= 1}
                  className="px-2 py-1 text-sm rounded border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  aria-label="prev"
                >
                  ‹
                </button>
                {getWindowPages(likedPage, likedTotalPages).map((p) => (
                  <button
                    key={`liked-page-${p}`}
                    onClick={() => loadLikedPage(p)}
                    disabled={likedLoading && p === likedPage}
                    className={`px-2 py-1 text-sm rounded border ${p === likedPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} hover:bg-blue-50`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => loadLikedPage(Math.min(likedTotalPages, likedPage + 1))}
                  disabled={likedLoading || likedPage >= likedTotalPages}
                  className="px-2 py-1 text-sm rounded border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  aria-label="next"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="relative">
              <div id="liked-places-scroll" className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {likedPlaces && likedPlaces.length > 0 ? (
                    (likedSort === 'name'
                      ? [...likedPlaces].sort((a, b) => (nameCache[a.placeId] || a.name || '').localeCompare(nameCache[b.placeId] || b.name || ''))
                      : likedPlaces
                    ).map((place) => renderPlaceCard(place))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center h-full">{t('noLikedPlaces')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 최근 본 장소 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg max-w-full overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('recentViews') || '최근 본 여행지'}</h2>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => loadRecentPage(Math.max(1, recentPage - 1))}
                  disabled={recentLoading || recentPage <= 1}
                  className="px-2 py-1 text-sm rounded border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  aria-label="prev"
                >
                  ‹
                </button>
                {getWindowPages(recentPage, recentTotalPages).map((p) => (
                  <button
                    key={`recent-page-${p}`}
                    onClick={() => loadRecentPage(p)}
                    disabled={recentLoading && p === recentPage}
                    className={`px-2 py-1 text-sm rounded border ${p === recentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} hover:bg-blue-50`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => loadRecentPage(Math.min(recentTotalPages, recentPage + 1))}
                  disabled={recentLoading || recentPage >= recentTotalPages}
                  className="px-2 py-1 text-sm rounded border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                  aria-label="next"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="relative">
              <div id="recent-places-scroll" className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentPlaces && recentPlaces.length > 0 ? (
                    (recentSort === 'name'
                      ? [...recentPlaces].sort((a, b) => (nameCache[a.placeId] || a.name || '').localeCompare(nameCache[b.placeId] || b.name || ''))
                      : recentPlaces
                    ).map((place) => renderPlaceCard(place))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center h-full">{t('noRecentViews')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* 프로필 카드 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg">
            <div className="p-6 h-full">
              {/* 프로필 헤더 */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {me?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>

                {/* 닉네임 */}
                <button
                  className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100 hover:underline"
                  onClick={() => setDisplayNameModalOpen(true)}
                >
                  {me?.displayName || '닉네임'}
                </button>
                {/* 이메일 */}
                <p className="text-sm mb-4 text-gray-600 dark:text-white">{me?.email}</p>

                
              </div>

              {/* 하단 메뉴 */}
              <div className="divide-y divide-gray-100 border rounded-lg">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  onClick={() => setDisplayNameModalOpen(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('editNickname')}
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('passwordChange')}
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                  onClick={handleLogout}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('logout')}
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left"
                  onClick={async () => {
                    const agree = confirm('정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
                    if (!agree) return;
                    
                    // 가짜 탈퇴 처리 (백엔드 호출 없이)
                    alert('회원탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.');
                    // 토큰/세션 정리 및 홈으로 이동
                    localStorage.removeItem('vk_token');
                    sessionStorage.clear();
                    window.location.href = '/';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
                  {t('deleteAccount')}
      </button>
              </div>
            </div>
          </div>

          {/* 미니 달력 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('calendar')}</h2>
            </div>
            <div className="p-3">
              <CalendarBoard 
                selectedDate={new Date()}
                onDateSelect={handleDateClick}
                schedules={{}}
                className="text-sm"
                showLegend={false}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 닉네임 변경 모달 */}
      {displayNameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('editNickname')}</h3>
            <form onSubmit={onSaveProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('nickname')}</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('enterNickname')}
                />
              </div>
              <div className="mb-4 hidden">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('changeLanguage')}
                </label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as 'KR' | 'EN')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="KR">{t('korean')}</option>
                  <option value="EN">{t('english')}</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDisplayNameModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('passwordChange')}</h3>
            <form onSubmit={handlePasswordSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('currentPassword')}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('enterCurrentPassword')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('enterNewPassword')}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('confirmNewPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('reenterNewPassword')}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {pwSaving ? t('saving') : t('change')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 최근 본 모달 제거됨 */}
      <FloatingActionButton />
    </div>
  );
}
