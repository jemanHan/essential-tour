/**
 * API 모니터링 컴포넌트 - 개발 환경에서 API 호출 상태 모니터링
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

interface ApiStats {
  cacheSize: number;
  activeRequests: number;
  requestCount: number;
}

const ApiMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<ApiStats>({ cacheSize: 0, activeRequests: 0, requestCount: 0 });

  useEffect(() => {
    // 개발 환경에서만 모니터링 활성화
    if (import.meta.env.DEV) {
      const interval = setInterval(() => {
        setStats(apiClient.getApiStats());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  // 개발 환경이 아니면 렌더링하지 않음
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="API 모니터"
      >
        📊
      </button>

      {/* 모니터 패널 */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-700">API 모니터</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">캐시 크기:</span>
              <span className="font-mono">{stats.cacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">활성 요청:</span>
              <span className={`font-mono ${stats.activeRequests > 3 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.activeRequests}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">분당 요청:</span>
              <span className={`font-mono ${stats.requestCount > 20 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.requestCount}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                apiClient.clearCache();
                setStats(apiClient.getApiStats());
              }}
              className="w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors"
            >
              캐시 클리어
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiMonitor;





