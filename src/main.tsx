import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import './i18n'
import { DarkModeProvider } from './contexts/DarkModeContext'
import GangnamMain from './pages/GangnamMain'
import Home from './pages/Home'
import DetailPage from './pages/DetailPage'
import MyPage from './pages/MyPage'
import SchedulePage from './pages/SchedulePage'
import ApiMonitor from './components/ApiMonitor'

import Signup from './pages/Signup'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

const router = createBrowserRouter([
  { path: '/', element: <GangnamMain /> }, // Hello-Gangnam 메인 페이지
  { path: '/nationwide', element: <Home /> }, // 전국 추천 여행지 (기존 Home)
  { path: '/places/:id', element: <DetailPage /> },
  { path: '/search', element: <Home /> }, // 검색 결과는 Home 컴포넌트 사용
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
  { path: '/mypage', element: <MyPage /> },
  { path: '/schedule', element: <SchedulePage /> }, // 임시로 보호 해제
  // { path: '/profile', element: <Profile /> }, // removed: merged into MyPage
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DarkModeProvider>
      <RouterProvider router={router} />
      <ApiMonitor />
    </DarkModeProvider>
  </React.StrictMode>,
)




