import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingActionButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 홈 화면 포함 전체 페이지에서 표시하도록 변경
  const isHomePage = false;

  const handleBackClick = () => {
    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* 홈 화면이 아닐 때만 뒤로 가기 버튼 표시 */}
      {!isHomePage && (
        <div 
          className="fixed bottom-6 right-6 z-50"
          style={{ zIndex: 9999 }}
        >
          <button
            type="button"
            onClick={handleBackClick}
            className="w-12 h-12 bg-white hover:bg-gray-50 text-gray-900 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
            title="뒤로 가기"
            style={{ 
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 9999,
              border: 'none',
              outline: 'none'
            }}
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingActionButton;
