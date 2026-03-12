import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TopBar from "../components/layout/TopBar";
import Footer from "../components/layout/Footer";
// 하드코딩된 장소 정보 데이터 (언어별 주소 포함)
const PLACE_DETAILS_DATA: Record<string, { address: string; addressEn?: string; rating: number; reviews: number }> = {
  // K-POP MV 촬영지 테마 (주소/영문주소/평점/리뷰 하드코딩)
  'ChIJufY8c6pDDDURw6IIswavqFk': {
    address: '대한민국 제주특별자치도 서귀포시 안덕면 사계리 131-8',
    addressEn: '131-8 Sagye-ri, Andeok-myeon, Seogwipo-si, Jeju-do, South Korea',
    rating: 4.6,
    reviews: 1520
  },
  'ChIJGVQOXbd3ezURbRuEUgEqcAY': {
    address: '대한민국 인천광역시 연수구 송도동 24-6',
    addressEn: '24-6 Songdo-dong, Yeonsu-gu, Incheon, South Korea',
    rating: 4.5,
    reviews: 980
  },
  'ChIJT8H4r9qifDURmuXJ_6m6vM0': {
    address: '대한민국 서울특별시 종로구 계동길',
    addressEn: 'Gye-dong-gil, Jongno-gu, Seoul, South Korea',
    rating: 4.7,
    reviews: 3210
  },
  'ChIJA8nY8ExPZjURPC-8kcf4l4E': {
    address: '대한민국 경상북도 경주시 황남동 포석로 일대',
    addressEn: 'Poseok-ro area, Hwangnam-dong, Gyeongju-si, Gyeongsangbuk-do, South Korea',
    rating: 4.4,
    reviews: 1240
  },
  'ChIJ5bPrXKbmYTURdcro_j76LSM': {
    address: '대한민국 강원특별자치도 동해시 강문동 경포대 해변',
    addressEn: 'Gyeongpo Beach, Gangmun-dong, Donghae-si, Gangwon-do, South Korea',
    rating: 4.5,
    reviews: 2100
  },
  // DMZ & 분단 역사 테마
  'ChIJm3V0fu2ifDURRJ8IMUijVtY': { // 광장시장
    address: '서울특별시 종로구 창경궁로 88',
    addressEn: '88 Changgyeonggung-ro, Jongno-gu, Seoul',
    rating: 4.3,
    reviews: 1200
  },
  'ChIJfYjlFvWifDURYSDsoxYbN80': { // 남대문시장
    address: '서울특별시 중구 남대문시장4길 21',
    addressEn: '21 Namdaemunsijang 4-gil, Jung-gu, Seoul',
    rating: 4.2,
    reviews: 890
  },
  'ChIJYxd6fL6ifDURy7wm894BUcQ': { // 통인시장
    address: '서울특별시 종로구 자하문로15길 18',
    addressEn: '18 Jahamun-ro 15-gil, Jongno-gu, Seoul',
    rating: 4.4,
    reviews: 650
  },
  'ChIJA6gxryiZfDURJvmbeBvdz_Y': { // 망원시장
    address: '서울특별시 마포구 포은로6길 27',
    addressEn: '27 Poeun-ro 6-gil, Mapo-gu, Seoul',
    rating: 4.5,
    reviews: 420
  },
  'ChIJOTEaKmiffDURNTst1Jzcm_c': { // 노량진수산물도매시장
    address: '서울특별시 동작구 노들로 674',
    addressEn: '674 Nodeul-ro, Dongjak-gu, Seoul',
    rating: 4.1,
    reviews: 380
  },
  
  // e스포츠 테마
  'ChIJny4XAzCjfDURddP-mnc3F5I': { // 롤파크
    address: '서울특별시 종로구 종로 33',
    addressEn: '33 Jongno, Jongno-gu, Seoul',
    rating: 4.7,
    reviews: 2100
  },
  'ChIJtVrU7smZfDURaQp3BkxFjr0': { // 이스포츠 명예의 전당
    address: '서울특별시 마포구 매봉산로 31 에스플렉스센터',
    addressEn: '31 Maebongsan-ro, Mapo-gu, Seoul',
    rating: 4.5,
    reviews: 890
  },
  'ChIJtyNIIwCffDUR6t9TVxQRkKo': { // 넷마블 게임 박물관
    address: '서울특별시 구로구 디지털로26길 38',
    addressEn: '38 Digital-ro 26-gil, Guro-gu, Seoul',
    rating: 4.3,
    reviews: 650
  },
  'ChIJr5vJBJqlfDUREEiXKv7g0Lk': { // T1 사옥
    address: '서울특별시 강남구 선릉로 627',
    addressEn: '627 Seolleung-ro, Gangnam-gu, Seoul',
    rating: 4.8,
    reviews: 3200
  },
  'ChIJeYgyHHSRezUR_2jZaVUIaBE': { // 인스파이어 아레나
    address: '인천광역시 중구 공항문화로 127',
    addressEn: '127 Gonghangmunhwa-ro, Jung-gu, Incheon',
    rating: 4.6,
    reviews: 1500
  },
  'ChIJ_xCS_d-jfDURgqxl66H3dd8': { // 하이커 그라운드
    address: '서울특별시 중구 청계천로 40',
    addressEn: '40 Cheonggyecheon-ro, Jung-gu, Seoul',
    rating: 4.4,
    reviews: 780
  },
  
  // 서울 도심 전망 테마
  'ChIJqWqOqFeifDURpYJ5LnxX-Fw': { // N서울타워
    address: '서울특별시 용산구 남산공원길 105',
    addressEn: '105 Namsangongwon-gil, Yongsan-gu, Seoul',
    rating: 4.5,
    reviews: 4500
  },
  'ChIJW2ZfkQqlfDUR4vz9Xs0Q66s': { // 롯데월드타워
    address: '서울특별시 송파구 올림픽로 300',
    addressEn: '300 Olympic-ro, Songpa-gu, Seoul',
    rating: 4.6,
    reviews: 3200
  },
  'ChIJn_UiGDyffDURWfZBRKwb5YE': { // 63스퀘어
    address: '서울특별시 영등포구 63로 50',
    addressEn: '50 63-ro, Yeongdeungpo-gu, Seoul',
    rating: 4.3,
    reviews: 1800
  },
  'ChIJLzszLIChfDURhVOQTkJ62oA': { // 세빛섬
    address: '서울특별시 서초구 올림픽대로 2085-14',
    addressEn: '2085-14 Olympic-daero, Seocho-gu, Seoul',
    rating: 4.4,
    reviews: 1200
  },
  
  // 한국의 명산 & 자연 경관 테마
  'ChIJ01rMH2ij2F8RftWPpRMs3kc': { // 설악산
    address: '강원도 속초시 설악산로 833',
    addressEn: '833 Seoraksan-ro, Sokcho-si, Gangwon-do',
    rating: 4.6,
    reviews: 1250
  },
  'ChIJXw508rQ3bjURk6aL3D1mbsg': { // 지리산
    address: '경상남도 하동군 화개면 대성리',
    addressEn: 'Daeseong-ri, Hwagae-myeon, Hadong-gun, Gyeongsangnam-do',
    rating: 4.5,
    reviews: 890
  },
  'ChIJA9hkSe_4DDURXkdwHzTjZlk': { // 한라산
    address: '제주특별자치도 제주시 1100로 2070-61',
    addressEn: '2070-61 1100-ro, Jeju-si, Jeju-do',
    rating: 4.7,
    reviews: 2100
  },
  'ChIJN2x0fu2ifDURheJ4-U3YaAA': { // 북한산
    address: '서울특별시 성북구 보국문로 262',
    addressEn: '262 Bogungmun-ro, Seongbuk-gu, Seoul',
    rating: 4.4,
    reviews: 680
  },
  'ChIJx2Obgg_zcTURObfo-XgmMQU': { // 무등산
    address: '광주광역시 북구 무등로 1550',
    addressEn: '1550 Mudeung-ro, Buk-gu, Gwangju',
    rating: 4.3,
    reviews: 420
  },
  
  // K-POP 데몬헌터 테마
  'ChIJdfT6qFulfDURzJT-qKKTqtM': { // 코엑스 K-POP 플라자
    address: '서울특별시 강남구 영동대로 513',
    addressEn: '513 Yeongdong-daero, Gangnam-gu, Seoul',
    rating: 4.6,
    reviews: 59
  },
  'ChIJ6RPSci2jfDURXTSdf7JjYp8': { // 낙산공원
    address: '서울특별시 종로구 낙산길 41',
    addressEn: '41 Naksan-gil, Jongno-gu, Seoul',
    rating: 4.4,
    reviews: 320
  },
  'ChIJ1Y4dnPWkfDUR5DNjpoAGbUU': { // 청담대교
    address: '서울특별시 광진구 자양동',
    addressEn: 'Jayang-dong, Gwangjin-gu, Seoul',
    rating: 4.2,
    reviews: 180
  },
  'ChIJzdyah1CkfDURaH-M8oS9AXc': { // 잠실올림픽주경기장
    address: '서울특별시 송파구 올림픽로 25',
    addressEn: '25 Olympic-ro, Songpa-gu, Seoul',
    rating: 4.5,
    reviews: 890
  },
  'ChIJXz2vx_GifDURImd3aTJZ1VA': { // 명동거리
    address: '서울특별시 중구 명동2가',
    addressEn: 'Myeongdong 2-ga, Jung-gu, Seoul',
    rating: 4.3,
    reviews: 1200
  },
  
  // DMZ & 분단 역사 테마
  'ChIJS3Dv5fXzfDURj3FHEIScjWk': { // 제3땅굴
    address: '경기도 파주시 군내면 점원리 산167-1',
    addressEn: 'San 167-1, Jeomwon-ri, Gunnae-myeon, Paju-si, Gyeonggi-do',
    rating: 4.1,
    reviews: 450
  },
  'ChIJA7KB6y3yfDURotGEP4eJ8qE': { // 임진각
    address: '경기도 파주시 문산읍 임진각로 148-40',
    addressEn: '148-40 Imjingak-ro, Munsan-eup, Paju-si, Gyeonggi-do',
    rating: 4.3,
    reviews: 680
  },
  'ChIJ4-IaFvvzfDURGc9rCXvxR-M': { // 도라전망대
    address: '경기도 파주시 장단면 제3땅굴로 310',
    addressEn: '310 Je3-tanggul-ro, Jangdan-myeon, Paju-si, Gyeonggi-do',
    rating: 4.2,
    reviews: 320
  },
  'ChIJzbchvDdR2F8Rg8djTNec-Yk': { // 고성통일전망타워
    address: '강원특별자치도 고성군 현내면 금강산로 481',
    addressEn: '481 Geumgangsan-ro, Hyeonnae-myeon, Goseong-gun, Gangwon-do',
    rating: 4.4,
    reviews: 280
  },
  'ChIJ0yFnY9BW2F8Rio-wXDrXqCQ': { // DMZ박물관
    address: '강원특별자치도 고성군 현내면 통일전망대로 369',
    addressEn: '369 Tongiljeonmang-daero, Hyeonnae-myeon, Goseong-gun, Gangwon-do',
    rating: 4.0,
    reviews: 150
  },
  
  // 조선왕조 테마 (historical-sites)
  'ChIJod7tSseifDUR9hXHLFNGMIs': { // 경복궁
    address: '서울특별시 종로구 사직로 161',
    addressEn: '161 Sajik-ro, Jongno-gu, Seoul',
    rating: 4.7,
    reviews: 3200
  },
  'ChIJowJoU8-jfDUR42Jhv2tmlL0': { // 숭례문
    address: '서울특별시 중구 세종대로 40',
    addressEn: '40 Sejong-daero, Jung-gu, Seoul',
    rating: 4.5,
    reviews: 1200
  },
  'ChIJ4wh0zluifDURaFBW2pdrKf8': { // 창덕궁
    address: '서울특별시 종로구 율곡로 99',
    addressEn: '99 Yulgok-ro, Jongno-gu, Seoul',
    rating: 4.6,
    reviews: 2100
  },
  'ChIJz7ocWtiifDURU-HmRwLa3yQ': { // 종묘
    address: '서울특별시 종로구 종로 157 종묘관리소',
    addressEn: '157 Jongno, Jongno-gu, Seoul',
    rating: 4.4,
    reviews: 890
  },
  'ChIJMcWZMY2ifDUR2NLv8F3Togc': { // 덕수궁
    address: '서울특별시 중구 세종대로 99',
    addressEn: '99 Sejong-daero, Jung-gu, Seoul',
    rating: 4.3,
    reviews: 680
  }
};

let staticHeroImages: string[] = [
  '/hero/n서울.jpg',
  '/hero/경복궁.jpg',
  '/hero/여행사진.jpg'
];

// K-Culture 투어 데이터 타입
interface KCultureSpot {
  id: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  category: 'kpop' | 'drama' | 'variety' | 'movie' | 'music';
  featured: string; // 어떤 작품에서 나왔는지
  image: string;
  estimatedTime: number;
  tips: string[];
}

// K-Culture 투어 타입
interface KCultureTour {
  id: string;
  title: string;
  description: string;
  spots: KCultureSpot[];
}

export default function GangnamMain() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedTour, setSelectedTour] = useState<KCultureTour | null>(null);
  const [showTourDetail, setShowTourDetail] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>(staticHeroImages);
  const rotationTimerRef = useRef<number | null>(null);
  const rotationIntervalMs = 8000; // 2배로 증가
  
// 장소 상세 정보 상태 (하드코딩된 데이터 사용)
const [placeDetails, setPlaceDetails] = useState<Record<string, { address: string; addressEn?: string; rating: number; reviews: number } | null>>({});
  const [loadingPlaceDetails, setLoadingPlaceDetails] = useState(false);

  // 언어 변경 시 컴포넌트 리렌더링
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [i18n.language]);

  // 스크롤 애니메이션
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-on-scroll');
          entry.target.classList.add('animate-slide-up-on-scroll');
          entry.target.classList.add('animate-fade-in-up-on-scroll');
        }
      });
    }, observerOptions);

    // K-Culture 섹션 요소들 관찰
    const kCultureSection = document.getElementById('k-culture-section');
    if (kCultureSection) {
      const title = kCultureSection.querySelector('h2');
      const description = kCultureSection.querySelector('p');
      const cards = kCultureSection.querySelectorAll('.group');

      if (title) observer.observe(title);
      if (description) observer.observe(description);
      cards.forEach(card => observer.observe(card));
    }

    return () => {
      observer.disconnect();
    };
  }, [refreshKey]);

  // hero 이미지 매니페스트 로드
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

  const clearRotation = () => {
    if (rotationTimerRef.current !== null) {
      clearInterval(rotationTimerRef.current);
      rotationTimerRef.current = null;
    }
  };

  const startRotation = () => {
    clearRotation();
    if (!heroImages.length) return;
    rotationTimerRef.current = window.setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, rotationIntervalMs);
  };

  // 이미지 로테이션
  useEffect(() => {
    startRotation();
    return () => clearRotation();
  }, [heroImages.length]);

  // 메인 테마 데이터 (사용자 기획안 반영)
  const kCultureTours: KCultureTour[] = [
    {
      id: 'historical-sites',
      title: t('historicalSites'),
      description: t('historicalSitesDescription'),
      spots: [
        { id: 'ChIJod7tSseifDUR9hXHLFNGMIs', name: t('gyeongbokgung'), description: t('gyeongbokgungDesc'), address: '서울특별시 종로구 사직로 161', lat: 37.5800, lng: 126.9800, category: 'movie', featured: 'Royal Palace', image: '/places/경복궁.png', estimatedTime: 120, tips: ['수문장 교대식 관람', '근정전과 경회루 필수 방문', '한복 체험 가능'] },
        { id: 'ChIJowJoU8-jfDUR42Jhv2tmlL0', name: t('sungnyemun'), description: t('sungnyemunDesc'), address: '대한민국 서울특별시 중구 세종대로 40', lat: 37.5600, lng: 126.9800, category: 'movie', featured: 'City Gate', image: '/places/숭례문.png', estimatedTime: 60, tips: ['조선왕조의 4대문 중 하나', '국보 제1호', '야간 조명이 아름다움'] },
        { id: 'ChIJ4wh0zluifDURaFBW2pdrKf8', name: t('changdeokgung'), description: t('changdeokgungDesc'), address: '대한민국 서울특별시 종로구 율곡로 99', lat: 37.5800, lng: 126.9900, category: 'movie', featured: 'UNESCO Heritage', image: '/places/창덕궁.png', estimatedTime: 150, tips: ['비원(후원) 투어 필수', '유네스코 세계문화유산', '조선왕조의 대표 궁궐'] },
        { id: 'ChIJz7ocWtiifDURU-HmRwLa3yQ', name: t('jongmyo'), description: t('jongmyoDesc'), address: '대한민국 서울특별시 종로구 종로 157 종묘관리소', lat: 37.5700, lng: 126.9900, category: 'movie', featured: 'Royal Shrine', image: '/places/종묘.png', estimatedTime: 90, tips: ['조선왕조의 사당', '제례악 공연 관람', '유네스코 세계문화유산'] },
        { id: 'ChIJMcWZMY2ifDUR2NLv8F3Togc', name: t('deoksugung'), description: t('deoksugungDesc'), address: '대한민국 서울특별시 중구 세종대로 99', lat: 37.5600, lng: 126.9700, category: 'movie', featured: 'Imperial Palace', image: '/places/덕수궁.png', estimatedTime: 90, tips: ['대한제국 황궁', '근대사 체험', '돌담길 산책'] }
      ]
    },
    {
      id: 'kpop-demon-hunters',
      title: t('kpopDemonHunters'),
      description: t('kpopDemonHuntersDescription'),
      spots: [
        { id: 'ChIJdfT6qFulfDURzJT-qKKTqtM', name: t('coexKpopPlaza'), description: t('coexKpopPlazaDesc'), address: '대한민국 서울특별시 강남구 영동대로 513', lat: 37.5100, lng: 127.0600, category: 'movie', featured: 'K-POP Movie', image: '/places/코엑스.png', estimatedTime: 90, tips: ['스타필드 별마당 도서관과 함께 방문', '서울 최대 규모 쇼핑몰 체험'] },
        { id: 'ChIJ6RPSci2jfDURXTSdf7JjYp8', name: t('naksanPark'), description: t('naksanParkDesc'), address: '대한민국 서울특별시 종로구 낙산길 41', lat: 37.5800, lng: 126.9900, category: 'movie', featured: 'K-POP Movie', image: '/places/낙산공원.png', estimatedTime: 120, tips: ['24시간 개방', '동대문 성곽과 DDP 근처', '과거와 현재가 공존하는 감성'] },
        { id: 'ChIJ1Y4dnPWkfDUR5DNjpoAGbUU', name: t('cheongdamBridge'), description: t('cheongdamBridgeDesc'), address: '대한민국 서울특별시 광진구 자양동', lat: 37.5200, lng: 127.0600, category: 'movie', featured: 'K-POP Movie', image: '/places/청담대교.png', estimatedTime: 60, tips: ['7호선 자양역에서 하차', '뚝섬한강공원으로 연결', 'Takedown 노래 장면 체험'] },
        { id: 'ChIJqWqOqFeifDURpYJ5LnxX-Fw', name: t('nSeoulTower'), description: t('nSeoulTowerDesc'), address: '서울특별시 용산구 남산공원길 105', lat: 37.5512, lng: 126.9882, category: 'movie', featured: 'K-POP Movie', image: '/places/N서울타워.jpg', estimatedTime: 90, tips: ['국립중앙박물관에서 타워 전망', '현대와 역사 건축물의 조화'] },
        { id: 'ChIJzdyah1CkfDURaH-M8oS9AXc', name: t('jamsilOlympicStadium'), description: t('jamsilOlympicStadiumDesc'), address: '대한민국 서울특별시 송파구 올림픽로 25', lat: 37.5200, lng: 127.1200, category: 'movie', featured: 'K-POP Movie', image: '/places/올림픽.jpg', estimatedTime: 90, tips: ['1988년 서울올림픽 유산', 'K-POP 공연장의 아이콘', 'How It\'s Done 데뷔 무대 장소'] },
        { id: 'ChIJXz2vx_GifDURImd3aTJZ1VA', name: t('myeongdongStreet'), description: t('myeongdongStreetDesc'), address: '대한민국 서울특별시 중구 명동2가', lat: 37.5600, lng: 126.9800, category: 'movie', featured: 'K-POP Movie', image: '/places/명동거리.jpg', estimatedTime: 120, tips: ['라이브공연과 쇼핑', '활기찬 서울의 분위기', '네온사인과 번화한 거리'] }
      ]
    },
    {
      id: 'kpop-mv-locations',
      title: t('kpopMvLocations'),
      description: t('kpopMvLocationsDescription'),
      spots: [
           { id: 'ChIJufY8c6pDDDURw6IIswavqFk', name: t('jejuSagyeBeach'), description: t('jejuSagyeBeachDesc'), address: '대한민국 제주특별자치도 서귀포시 안덕면 사계리 131-8', lat: 33.2400, lng: 126.4000, category: 'music', featured: 'BTS For You', image: '/places/경포대해변.png', estimatedTime: 120, tips: ['일몰 시간대 방문 추천', 'BTS 팬들의 성지 순례', '한라산과 바다의 조화 감상'] },
        { id: 'ChIJGVQOXbd3ezURbRuEUgEqcAY', name: t('incheonSongdoTribowl'), description: t('incheonSongdoTribowlDesc'), address: '대한민국 인천광역시 연수구 송도동 24-6', lat: 37.3900, lng: 126.6500, category: 'music', featured: 'EXO Miracles in December', image: '/places/트라이보울.png', estimatedTime: 90, tips: ['야간 조명이 아름다움', '미래형 건축물 감상', '송도 센트럴파크와 함께 방문'] },
        { id: 'ChIJT8H4r9qifDURmuXJ_6m6vM0', name: t('seoulBukchonHanok'), description: t('seoulBukchonHanokDesc'), address: '대한민국 서울특별시 종로구 계동길', lat: 37.5800, lng: 126.9800, category: 'music', featured: 'IU Through the Night', image: '/places/한옥마을.png', estimatedTime: 120, tips: ['한복 체험 가능', '전통 한옥 건축 감상', '조용한 시간대 방문 추천'] },
        { id: 'ChIJA8nY8ExPZjURPC-8kcf4l4E', name: t('gyeongjuHwanglidan'), description: t('gyeongjuHwanglidanDesc'), address: '대한민국 경상북도 경주시 황남동 포석로 일대', lat: 35.8500, lng: 129.2000, category: 'music', featured: 'SEVENTEEN Darl+ing', image: '/places/황리단길.png', estimatedTime: 150, tips: ['카페 투어 추천', '셀프 포토존 활용', '전통과 현대의 조화 체험'] },
        { id: 'ChIJ5bPrXKbmYTURdcro_j76LSM', name: t('gangneungGyeongpoBeach'), description: t('gangneungGyeongpoBeachDesc'), address: '대한민국 강원특별자치도 동해시 강문동 경포대 해변', lat: 37.8000, lng: 128.9000, category: 'music', featured: 'Taeyeon Four Seasons', image: '/places/경포대해변.png', estimatedTime: 180, tips: ['사계절 다양한 색감', '일출/일몰 감상', '동해 바다의 아름다움'] }
      ]
    },
    {
      id: 'dmz-history',
      title: t('dmzHistory'),
      description: t('dmzHistoryDescription'),
      spots: [
        { id: 'ChIJS3Dv5fXzfDURj3FHEIScjWk', name: t('thirdTunnelName'), description: t('thirdTunnelDesc'), address: '경기도 파주시 군내면 점원리 산167-1', lat: 37.9167, lng: 126.7167, category: 'movie', featured: 'DMZ', image: '/places/제3땅굴.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJA7KB6y3yfDURotGEP4eJ8qE', name: t('imjingakName'), description: t('imjingak'), address: '경기도 파주시 문산읍 임진각로 148-40', lat: 37.8922482, lng: 126.7430603, category: 'movie', featured: 'DMZ', image: '/places/임진각.jpg', estimatedTime: 90, tips: [] },
        { id: 'ChIJ4-IaFvvzfDURGc9rCXvxR-M', name: t('dorasanName'), description: t('dorasan'), address: '경기도 파주시 장단면 제3땅굴로 310', lat: 37.9167, lng: 126.7167, category: 'movie', featured: 'DMZ', image: '/places/도라전망대.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJzbchvDdR2F8Rg8djTNec-Yk', name: t('goseongTowerName'), description: t('goseongTower'), address: '강원특별자치도 고성군 현내면 금강산로 481', lat: 38.3333, lng: 128.5000, category: 'movie', featured: 'DMZ', image: '/places/고성통일전망타워.png', estimatedTime: 60, tips: [] },
        { id: 'ChIJ0yFnY9BW2F8Rio-wXDrXqCQ', name: t('dmzMuseumName'), description: t('dmzMuseum'), address: '강원특별자치도 고성군 현내면 통일전망대로 369', lat: 37.8925, lng: 126.7175, category: 'movie', featured: 'DMZ', image: '/places/DMZ박물관.jpg', estimatedTime: 45, tips: [] }
      ]
    },
    {
      id: 'traditional-market',
      title: t('traditionalMarket'),
      description: t('traditionalMarketDescription'),
      spots: [
        { id: 'ChIJm3V0fu2ifDURRJ8IMUijVtY', name: t('gwangjangMarketName'), description: t('gwangjangMarket'), address: '서울특별시 종로구 창경궁로 88', lat: 37.5700, lng: 126.9900, category: 'movie', featured: 'Market', image: '/places/광장시장.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJfYjlFvWifDURYSDsoxYbN80', name: t('namdaemunMarketName'), description: t('namdaemunMarket'), address: '서울특별시 중구 남대문시장4길 21', lat: 37.5600, lng: 126.9800, category: 'movie', featured: 'Market', image: '/places/남대문시장.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJYxd6fL6ifDURy7wm894BUcQ', name: t('tonginMarketName'), description: t('tonginMarket'), address: '서울특별시 종로구 자하문로15길 18', lat: 37.5800, lng: 126.9700, category: 'movie', featured: 'Market', image: '/places/통인시장.jpg', estimatedTime: 45, tips: [] },
        { id: 'ChIJA6gxryiZfDURJvmbeBvdz_Y', name: t('mangwonMarketName'), description: t('mangwonMarket'), address: '서울특별시 마포구 포은로6길 27', lat: 37.5500, lng: 126.9000, category: 'movie', featured: 'Market', image: '/places/망원시장.png', estimatedTime: 45, tips: [] },
        { id: 'ChIJOTEaKmiffDURNTst1Jzcm_c', name: t('noryangjinMarketName'), description: t('noryangjinMarket'), address: '서울특별시 동작구 노들로 674', lat: 37.5100, lng: 126.9400, category: 'movie', featured: 'Market', image: '/places/노량진수산물도매시장.jpg', estimatedTime: 60, tips: [] }
      ]
    },
    {
      id: 'esports-tour',
      title: t('esports'),
      description: t('esportsDescription'),
      spots: [
        { id: 'ChIJny4XAzCjfDURddP-mnc3F5I', name: t('lolParkName'), description: t('lolPark'), address: '서울특별시 종로구 종로 33', lat: 37.5700, lng: 126.9780, category: 'variety', featured: 'eSports', image: '/places/롤파크.jpg', estimatedTime: 90, tips: [] },
        { id: 'ChIJtVrU7smZfDURaQp3BkxFjr0', name: t('esportsHallName'), description: t('esportsHall'), address: '서울특별시 마포구 매봉산로 31 에스플렉스센터', lat: 37.5500, lng: 126.9500, category: 'variety', featured: 'eSports', image: '/places/이스포츠 명예의 전당.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJtyNIIwCffDUR6t9TVxQRkKo', name: t('netmarbleMuseumName'), description: t('netmarbleMuseum'), address: '서울특별시 구로구 디지털로26길 38', lat: 37.4800, lng: 126.8900, category: 'variety', featured: 'eSports', image: '/places/넷마블 게임 박물관.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJr5vJBJqlfDUREEiXKv7g0Lk', name: t('t1BuildingName'), description: t('t1Building'), address: '서울특별시 강남구 선릉로 627', lat: 37.5200, lng: 127.0400, category: 'variety', featured: 'eSports', image: '/places/T1 사옥.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJeYgyHHSRezUR_2jZaVUIaBE', name: t('inspireArenaName'), description: t('inspireArena'), address: '인천광역시 중구 공항문화로 127', lat: 37.4500, lng: 126.4500, category: 'variety', featured: 'eSports', image: '/places/인스파이어 아레나.jpg', estimatedTime: 90, tips: [] },
        { id: 'ChIJ_xCS_d-jfDURgqxl66H3dd8', name: t('hikrGroundName'), description: t('hikrGround'), address: '서울특별시 중구 청계천로 40', lat: 37.5700, lng: 126.9800, category: 'variety', featured: 'eSports', image: '/places/하이커 그라운드.jpg', estimatedTime: 60, tips: [] }
      ]
    },
    {
      id: 'seoul-skyline',
      title: t('seoulSkyline'),
      description: t('seoulSkylineDescription'),
      spots: [
        { id: 'ChIJqWqOqFeifDURpYJ5LnxX-Fw', name: t('nSeoulTowerSkylineName'), description: t('nSeoulTowerSkylineDesc'), address: '서울특별시 용산구 남산공원길 105', lat: 37.5512, lng: 126.9882, category: 'movie', featured: 'Skyline', image: '/places/N서울타워.jpg', estimatedTime: 90, tips: ['국립중앙박물관에서 타워 전망', '현대와 역사 건축물의 조화'] },
        { id: 'ChIJW2ZfkQqlfDUR4vz9Xs0Q66s', name: t('lotteWorldTowerName'), description: t('lotteWorldTower'), address: '서울특별시 송파구 올림픽로 300', lat: 37.5125, lng: 127.1025, category: 'movie', featured: 'Skyline', image: '/places/롯데월드타워.jpg', estimatedTime: 90, tips: [] },
        { id: 'ChIJn_UiGDyffDURWfZBRKwb5YE', name: t('square63Name'), description: t('sixtyThreeSquare'), address: '서울특별시 영등포구 63로 50', lat: 37.5200, lng: 126.9400, category: 'movie', featured: 'Skyline', image: '/places/63스퀘어.jpg', estimatedTime: 90, tips: [] },
        { id: 'ChIJLzszLIChfDURhVOQTkJ62oA', name: t('sebitIslandName'), description: t('sebitIsland'), address: '서울특별시 서초구 올림픽대로 2085-14', lat: 37.5200, lng: 127.0000, category: 'movie', featured: 'Skyline', image: '/places/세빛섬.jpg', estimatedTime: 60, tips: [] },
        { id: 'ChIJN2x0fu2ifDURheJ4-U3YaAA', name: t('bukhanMountainName'), description: t('bukhansanPark'), address: '서울특별시 성북구 보국문로 262', lat: 37.7200, lng: 126.9800, category: 'movie', featured: 'Skyline', image: '/places/북한산국립공원.jpg', estimatedTime: 120, tips: [] },
      ]
    },
    {
      id: 'korean-mountains',
      title: t('koreanMountains'),
      description: t('koreanMountainsDescription'),
      spots: [
        { id: 'ChIJ01rMH2ij2F8RftWPpRMs3kc', name: t('seorakMountainName'), description: t('seoraksan'), address: '강원도 속초시 설악산로 833', lat: 38.1217, lng: 128.4656, category: 'variety', featured: 'Mountains', image: '/places/설악산.jpg', estimatedTime: 300, tips: ['가을 단풍 시즌 최고의 명산', '울산바위와 권금성 필수 방문'] },
        { id: 'ChIJXw508rQ3bjURk6aL3D1mbsg', name: t('jiriMountainName'), description: t('jirisan'), address: '경상남도 하동군 화개면 대성리', lat: 35.3333, lng: 127.7167, category: 'variety', featured: 'Mountains', image: '/places/지리산.jpg', estimatedTime: 480, tips: ['장거리 종주 코스 or 단거리 하동·구례 코스 선택 가능', '천왕봉 일출 명소'] },
        { id: 'ChIJA9hkSe_4DDURXkdwHzTjZlk', name: t('hallaMountainName'), description: t('hallasan'), address: '제주특별자치도 제주시 1100로 2070-61', lat: 33.3617, lng: 126.5292, category: 'variety', featured: 'Mountains', image: '/places/한라산.jpg', estimatedTime: 360, tips: ['겨울 설경 + 봄 철쭉 시즌 필수 방문', '백록담 분화구 호수 체험'] },
        { id: 'ChIJN2x0fu2ifDURheJ4-U3YaAA', name: t('bukhanMountainName'), description: t('bukhansan'), address: '서울특별시 성북구 보국문로 262', lat: 37.7000, lng: 126.9800, category: 'variety', featured: 'Mountains', image: '/places/북한산.jpg', estimatedTime: 180, tips: ['북한산성 입구 코스 추천 (2~3시간)', '서울 시내 접근성 최고'] },
        { id: 'ChIJx2Obgg_zcTURObfo-XgmMQU', name: t('mudungMountainName'), description: t('mudungsan'), address: '광주광역시 북구 무등로 1550', lat: 35.1333, lng: 126.9833, category: 'variety', featured: 'Mountains', image: '/places/무등산.jpg', estimatedTime: 240, tips: ['일출·야경 포인트', '광주 시내와 가까움', '입석대 천연 암석기둥 체험'] }
      ]
    },
    // K-POP MV 테마 제거됨
    {
      id: 'coming-soon',
      title: t('comingSoon'),
      description: t('comingSoonDescription'),
      spots: []
    }
  ];

  const handleTourSelect = (tour: KCultureTour) => {
    setSelectedTour(tour);
    setShowTourDetail(true);
    
    // 하드코딩된 장소 정보 로드
    if (tour.spots.length > 0) {
      setLoadingPlaceDetails(true);
      const details: Record<string, { address: string; addressEn?: string; rating: number; reviews: number } | null> = {};
      tour.spots.forEach(spot => {
        // 즉시 로드
        // PLACE_DETAILS_DATA에 addressEn이 포함되어 있으므로 그대로 전달
        details[spot.id] = (PLACE_DETAILS_DATA as any)[spot.id] || null;
      });
      setPlaceDetails(details);
      setLoadingPlaceDetails(false);
    }
  };



  const handleStartTour = (tour: KCultureTour) => {
    // TODO: 투어 시작 로직 구현
    console.log(t('startTheme'), ':', tour.title);
    // 지도 연동, 네비게이션 등
  };

  const handleSpotClick = (spot: KCultureSpot) => {
    // 장소 클릭 시 바로 상세 페이지로 이동
    navigate(`/places/${spot.id}`);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <TopBar />
      
      {/* Hero Section */}
      <div className="relative min-h-[60vh] md:min-h-[80vh] overflow-hidden">
        {/** 현재 배너 이미지가 '여행사진.jpg'일 때 텍스트를 검정으로 처리 */}
        {/** NOTE: heroImages는 파일 상단에 정의된 동일 배열을 사용 */}
        {/** '/static/hero/여행사진.jpg' 경로 매칭 */}
        {/** 렌더 구간에서 사용할 플래그 */}
        {/* eslint-disable-next-line */}
        {/* no-op placeholder removed */}
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
        
      {/* 수동 네비게이션 버튼 제거 */}

        {/* 텍스트 - 좌측 하단 */}
        <div className="relative z-10 container-xl flex min-h-[60vh] md:min-h-[80vh] items-end pb-8 md:pb-12">
          <div className="max-w-2xl">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-lg mb-2">
              {t('mainTitle')}
            </h1>
            <p className="text-white text-lg md:text-xl drop-shadow-md">
              {t('mainSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* K-Culture Tours Section - Enhanced */}
      <div className="container mx-auto px-4 py-16 relative dark:bg-gray-800" id="k-culture-section">
        {/* 배경 파티클 효과 - 시원한 색상으로 변경 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full opacity-25 animate-ping"></div>
        </div>

        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('kCulture')}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {t('kCultureDescription')}
          </p>
        </div>

        {/* 3칸 그리드 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {kCultureTours.map((tour, index) => (
            <div 
              key={`${tour.id}-${refreshKey}`} 
              className="group relative bg-white dark:bg-gray-700 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-700 flex flex-col h-full cursor-pointer transform hover:-translate-y-2 hover:scale-[1.04] opacity-0 animate-fade-in-up-on-scroll card-tilt"
              onClick={() => handleTourSelect(tour)}
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              <div className="animated-gradient-border"></div>
              {/* 그라데이션 오버레이 - 더 예쁘게 개선 */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              
              {/* 글로우 효과 - 더 예쁘게 개선 */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-indigo-400/30 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10" style={{animation: 'glowPulse 3s ease-in-out infinite'}}></div>
              
              {/* 메인 이미지 컨테이너 */}
              <div className="h-56 relative overflow-hidden" style={{perspective: '1000px'}}>
                <img 
                  src={tour.id === 'kpop-demon-hunters' ? '/places/KPOPDEMON.png' : (tour.id === 'coming-soon' ? '/places/soon.png' : (tour.spots[0]?.image || '/places/경복궁.png'))} 
                  alt={tour.spots[0]?.name || tour.title}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${tour.id === 'kpop-demon-hunters' ? 'object-bottom' : ''}`}
                  onError={(e) => {
                    e.currentTarget.src = '/places/경복궁.png';
                  }}
                />
                
                {/* 이미지 오버레이 - 더 예쁘게 개선 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="shine-overlay"></div>
              </div>

              {/* 기본 콘텐츠 영역 */}
              <div className="p-4 flex flex-col flex-1 relative z-20">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-cyan-600 transition-colors duration-300">
                  {tour.title}
                </h3>
                <p className="text-gray-600 dark:text-white mb-3 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 text-sm">
                  {tour.description}
                </p>
              </div>

              {/* (요청) 카드 내부 작은 반짝임 동그라미 제거 */}
            </div>
          ))}
        </div>
      </div>



      {/* Tour Detail Modal */}
      {showTourDetail && selectedTour && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] min-h-[80vh] flex flex-col shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
            {/* 헤더 - 파란색/하늘색 그라데이션 배경 */}
            <div className="bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 p-6 sm:p-8 md:p-10 lg:p-12 text-white rounded-t-2xl overflow-hidden min-h-[200px] flex flex-col justify-start pt-8">
              {/* 배경 장식 요소들 - 파란색 계열로 개선 */}
              <div className="bg-gradient-to-r from-white/20 via-white/10 to-transparent"></div>
              <div className="bg-gradient-to-b from-transparent via-white/5 to-white/20"></div>
              
              <div className="relative">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
                      {selectedTour.title}
                    </h3>
                    <p className="text-white/90 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mb-2">
                      {selectedTour.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTourDetail(false)}
                  className="absolute -top-2 -right-2 p-2 sm:p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 콘텐츠 영역 - 스크롤 가능하도록 분리 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{t('themeRecommendation')}</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedTour.spots.map((spot, index) => (
                    <button
                      key={spot.id}
                      className="group text-left border-2 border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-700 transform hover:-translate-y-2"
                      onClick={() => handleSpotClick(spot)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 p-6">
                        <div className="relative w-full h-48 md:w-45 md:h-36 rounded-xl overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-300">
                          <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="space-y-3 md:space-y-3 space-y-4">
                        <div className="flex items-start justify-between">
                          <h5 className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors">{spot.name}</h5>
                        </div>
                          <p className="text-gray-600 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{spot.description}</p>
                          
                          {/* 장소 상세 정보 표시 */}
                          {placeDetails[spot.id] && (
                            <div className="space-y-2">
                              {/* 주소 */}
                              {placeDetails[spot.id]?.address && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {i18n.language.startsWith('en') 
                                      ? placeDetails[spot.id]?.addressEn || placeDetails[spot.id]?.address
                                      : placeDetails[spot.id]?.address
                                    }
                                  </p>
                                </div>
                              )}
                              
                              {/* 평점 */}
                              {placeDetails[spot.id]?.rating && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                      {placeDetails[spot.id]?.rating?.toFixed(1)}
                                    </span>
                                    {placeDetails[spot.id]?.reviews && (
                                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                        ({placeDetails[spot.id]?.reviews} {t('reviews')})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 로딩 상태 */}
                          {loadingPlaceDetails && (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-gray-500">{t('loadingPlaceInfo')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTourDetail(false);
                    setPlaceDetails({});
                    setLoadingPlaceDetails(false);
                  }}
                  className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('close')}
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

    </div>
  );
}
