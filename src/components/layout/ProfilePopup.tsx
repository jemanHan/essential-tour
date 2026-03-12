import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logout } from "../../api/auth";
import { getMe, Me } from "../../api/users";
import { useDarkMode } from "../../contexts/DarkModeContext";

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function ProfilePopup({ isOpen, onClose, triggerRef }: ProfilePopupProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark, toggleDarkMode } = useDarkMode();
  const popupRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // 사용자 정보 가져오기
  useEffect(() => {
    if (isOpen && !user && !loading) {
      setLoading(true);
      getMe()
        .then(setUser)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, user, loading]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    onClose();
    // 언어 변경 후 페이지 새로고침
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]"
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {loading ? '...' : user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {loading ? t('loading') : user?.displayName || user?.email || t('user')}
            </div>
            <div className="text-xs text-gray-500 break-all">
              {loading ? '...' : user?.email || 'user@example.com'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-1">
        <Link
          to="/mypage"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
          </svg>
          {t('mypage')}
        </Link>

        <Link
          to="/schedule"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M4 19h16M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
          </svg>
          {t('schedule')}
        </Link>
        
        
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t('logout')}
        </button>
      </div>
    </div>
  );
}
