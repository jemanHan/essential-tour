import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isAuthenticated } from "../../api/auth";
import { getMe, Me } from "../../api/users";
import ProfilePopup from "./ProfilePopup";
import { useDarkMode } from "../../contexts/DarkModeContext";

export default function TopBar() {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const nav = useNavigate();
  const authenticated = isAuthenticated();
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [logoError, setLogoError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<Me | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 특정 페이지에서는 처음부터 검은색 글씨로 표시
  const shouldShowDarkText = location.pathname.includes('/mypage') || 
                            location.pathname.includes('/schedule') || 
                            location.pathname.includes('/places/') ||
                            location.pathname.includes('/detail/') ||
                            location.pathname.includes('/login') ||
                            location.pathname.includes('/signup');

  // 사용자 정보 가져오기
  useEffect(() => {
    if (authenticated) {
      getMe()
        .then(setUser)
        .catch(console.error);
    }
  }, [authenticated]);

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="relative z-[70]"
      onMouseLeave={() => setIsOpen(false)}
      data-debug-nav={isOpen ? "open" : "closed"}
    >
      {/* Fixed Navigation Bar */}
      <div className={`fixed inset-x-0 top-0 z-[60] transition-all duration-250 ease-out ${
        isOpen || isScrolled || shouldShowDarkText ? "bg-white shadow-md" : "bg-transparent"
      }`}>
        {/* Logo - Fixed Left Position with responsive spacing */}
        <div className="absolute left-4 sm:left-6 md:left-8 lg:left-12 xl:left-16 top-1/2 transform -translate-y-1/2 z-10">
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-all duration-250 ease-out"
            onClick={() => {
              // 드롭다운 닫기
              setIsOpen(false);
              // 메인페이지로 이동
              nav('/');
            }}
          >
            {!logoError ? (
              <img
                src="/HelloKorea.png"
                alt="Hello Korea"
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain cursor-pointer max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-none"
                onError={() => setLogoError(true)}
              />
            ) : (
                <span className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-lg transition-all duration-250 ease-out cursor-pointer ${
                  isOpen || isScrolled || shouldShowDarkText ? "text-gray-900 drop-shadow-none" : "text-white"
                }`}>
                Hello Korea
              </span>
            )}
          </Link>
        </div>

        {/* Search and Profile - Fixed Right Position */}
        <div className="absolute right-4 sm:right-6 md:right-8 lg:right-12 xl:right-16 top-1/2 transform -translate-y-1/2 z-20">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Dark Mode Toggle - hidden on mobile, visible on desktop */}
            <button
              aria-label="toggle dark mode"
              className={`hidden md:flex w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full items-center justify-center transition-all ${isOpen || isScrolled || shouldShowDarkText ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              onClick={toggleDarkMode}
            >
              {isDark ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.05 6.05A.75.75 0 006 7.05l1.59 1.591a.75.75 0 001.06-1.06L7.05 6.05zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.05 16.95a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 00-1.06-1.061l-1.591 1.59z"/>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.752-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
                </svg>
              )}
            </button>
            {/* Global Language Switcher - rightmost */}
            <div className="relative order-3">
              <button
                aria-label="change language"
                className={`w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-lg transition-all duration-250 ease-out relative ${isOpen || isScrolled || shouldShowDarkText ? 'bg-gray-100 text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                onClick={() => {
                  // 햄버거 메뉴가 열려있으면 닫고 언어 드롭다운 열기
                  if (isOpen) {
                    setIsOpen(false);
                    // 약간의 지연 후 언어 드롭다운 열기
                    setTimeout(() => {
                      const dd = document.getElementById('global-lang-dd');
                      dd?.classList.remove('hidden');
                    }, 100);
                    return;
                  }
                  // 언어 드롭다운
                  const dd = document.getElementById('global-lang-dd');
                  dd?.classList.toggle('hidden');
                }}
              >
                {localStorage.getItem('i18nextLng')?.startsWith('ko') ? 'KR' : 'EN'}
                {/* 모바일에서만 다크모드 아이콘 표시 */}
                <div className="md:hidden absolute -top-1 -right-1 w-4 h-4 bg-white/90 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                  {isDark ? (
                    <svg className="w-2.5 h-2.5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.752-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.05 6.05A.75.75 0 006 7.05l1.59 1.591a.75.75 0 001.06-1.06L7.05 6.05zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.05 16.95a.75.75 0 001.06 1.06l1.591-1.59a.75.75 0 00-1.06-1.061l-1.591 1.59z"/>
                    </svg>
                  )}
                </div>
              </button>
              <div id="global-lang-dd" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                {/* 다크모드 토글 - 모바일에서만 표시 */}
                <div className="md:hidden px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('darkMode')}</span>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDark ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {/* 언어 선택 */}
                <button
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${localStorage.getItem('i18nextLng')?.startsWith('ko') ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
                  onClick={() => { localStorage.setItem('i18nextLng','ko'); window.location.reload(); }}
                >🇰🇷 {t('korean')}</button>
                <button
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${localStorage.getItem('i18nextLng')?.startsWith('en') ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}
                  onClick={() => { localStorage.setItem('i18nextLng','en'); window.location.reload(); }}
                >🇺🇸 {t('english')}</button>
              </div>
            </div>
            {/* Search removed as requested */}
            <div className="relative">
              {authenticated ? (
                <>
                  <button
                    ref={profileButtonRef}
                    onClick={() => {
                      // 햄버거 메뉴가 열려있으면 닫고 프로필 팝업 열기
                      if (isOpen) {
                        setIsOpen(false);
                        // 약간의 지연 후 프로필 팝업 열기
                        setTimeout(() => {
                          setShowProfile(true);
                        }, 100);
                        return;
                      }
                      // 언어 드롭다운 닫기
                      const dd = document.getElementById('global-lang-dd');
                      dd?.classList.add('hidden');
                      setShowProfile(!showProfile);
                    }}
                    className={`w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-lg transition-all duration-250 ease-out ${
                      isOpen || isScrolled
                        ? "bg-gray-100 text-gray-900" 
                        : shouldShowDarkText ? "bg-gray-100 text-gray-900" : "bg-white/20 hover:bg-white/30 text-white"
                    }`}
                  >
                    MY
                  </button>
                  
                  {/* 프로필 팝업 */}
                  {showProfile && (
                    <ProfilePopup 
                      isOpen={showProfile}
                      onClose={() => setShowProfile(false)}
                      triggerRef={profileButtonRef}
                    />
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className={`px-4 py-3 md:px-6 md:py-4 backdrop-blur-sm font-semibold rounded-full transition-all duration-250 ease-out text-base md:text-lg ${
                    isOpen || isScrolled
                      ? "bg-gray-100 text-gray-900" 
                      : shouldShowDarkText ? "bg-gray-100 text-gray-900" : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button - Only visible on small screens */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden z-20">
          <button
            type="button"
            className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-250 ease-out ${
              isOpen || isScrolled || shouldShowDarkText ? "bg-gray-100 text-gray-900" : "bg-white/20 hover:bg-white/30 text-white"
            }`}
            onClick={() => {
              // 언어 드롭다운 닫기
              const dd = document.getElementById('global-lang-dd');
              dd?.classList.add('hidden');
              setIsOpen(!isOpen);
            }}
            aria-label="메뉴"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className="mx-auto max-w-screen-xl flex justify-center items-center h-16 md:h-20 px-4 md:px-6">
          {/* Center: Main Navigation - Hidden on small screens to prevent overlap */}
          <nav className="hidden md:flex justify-center items-center">
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
              <Link 
                to="/" 
                className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold md:font-bold hover:text-yellow-300 transition-all duration-250 ease-out drop-shadow-md inline-flex items-center ${
                  isOpen || isScrolled || shouldShowDarkText ? "text-gray-900 drop-shadow-none" : "text-white"
                }`}
              >
                {t('home')}
              </Link>
              <Link 
                to="/nationwide" 
                className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold md:font-bold hover:text-yellow-300 transition-all duration-250 ease-out drop-shadow-md inline-flex items-center ${
                  isOpen || isScrolled || shouldShowDarkText ? "text-gray-900 drop-shadow-none" : "text-white"
                }`}
              >
                {t('nationwide')}
              </Link>
              <button
                type="button"
                className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold md:font-bold hover:text-yellow-300 transition-all duration-250 ease-out drop-shadow-md inline-flex items-center ${
                  isOpen || isScrolled || shouldShowDarkText ? "text-gray-900 drop-shadow-none" : "text-white"
                }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls="mega-menu"
              >
                {t('myInfo')}
                <svg className="ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </nav>
        </div>

        {/* 드롭다운 메뉴 */}
        {isOpen && (
          <div 
            className="absolute inset-x-0 top-16 md:top-20 bg-white shadow-lg transform transition-all duration-300 ease-out z-40 animate-slideDown"
            role="menu"
            aria-label="메뉴"
            id="mega-menu"
          >
            <div className="mx-auto max-w-screen-xl px-4 md:px-6 py-6 md:py-8">
              {/* Mobile Navigation - Only visible on small screens */}
              <div className="md:hidden mb-6">
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/" 
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-all duration-250 ease-out flex items-center py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    {t('home')}
                  </Link>
                  <Link 
                    to="/nationwide" 
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-all duration-250 ease-out flex items-center py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {t('nationwide')}
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4"></h3>
                  <ul className="space-y-2 md:space-y-3">
                    <li>
                      <Link 
                        to="/mypage" 
                        className="text-sm md:text-base text-gray-700 hover:text-blue-600 transition-all duration-250 ease-out flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {t('mypage')}
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/schedule" 
                        className="text-sm md:text-base text-gray-700 hover:text-blue-600 transition-all duration-250 ease-out flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {t('mySchedule')}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}