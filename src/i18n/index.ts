import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 한국어 번역
const ko = {
  translation: {
    // 공통
    home: '홈',
    login: '로그인',
    logout: '로그아웃',
    mypage: '마이페이지',
    mySchedule: '나의 일정',
    search: '검색',
    searchPlaceholder: '여행지를 검색하세요',
    loading: '로딩 중...',
    user: '사용자',
    
    // 네비게이션
    nationwide: '전국 추천 여행지',
    myInfo: '내 정보',
    
    // K-Culture 테마
    kCulture: 'K-Culture 테마',
    kCultureDescription: '역사, 자연, 현대문화를 아우르는 한국의 진짜 매력을 발견하는 여행',
    
    // 테마들
    dmzHistory: 'DMZ & 분단 역사 테마',
    dmzHistoryDescription: '분단의 현장을 돌아보며 평화의 의미를 되새기는 역사 체험 코스',
    esports: 'e스포츠 테마',
    esportsDescription: '한국 e스포츠의 성장과 문화를 체험하는 특별한 투어',
    traditionalMarket: '전통시장 테마',
    traditionalMarketDescription: '한국의 전통 시장에서 느끼는 진정한 로컬 문화 체험',
    seoulSkyline: '서울 도심 전망 테마',
    seoulSkylineDescription: '서울의 아름다운 스카이라인을 감상할 수 있는 전망 명소들',
    koreanMountains: '한국의 명산 & 자연 경관 테마',
    koreanMountainsDescription: '대한민국을 대표하는 국립공원과 명산들을 탐방하는 자연 체험 테마',
    kpopMv: 'K-POP 뮤직비디오 촬영지 테마',
    kpopMvDescription: 'K-POP 대표 아티스트들의 촬영지를 따라가는 테마',
    
    // 장소 정보
    estimatedTime: '체류시간',
    minutes: '분',
    hours: '시간',
    address: '주소',
    tips: '팁',
    viewOnMap: '지도에서 보기',
    viewDetail: '상세페이지 보기',
    
    // 언어 변경
    language: 'Korean',
    korean: '한국어',
    english: 'English',
    changeLanguage: '언어 변경',
    
    // 장소 설명들
    thirdTunnelName: '제3땅굴',
    thirdTunnelDesc: '남북 대치의 긴장감을 직접 체험 가능한 장소',
    imjingakName: '임진각 평화공원',
    imjingak: '분단 현실과 평화를 상징하는 대표적 관광지',
    dorasanName: '도라산 전망대',
    dorasan: '북한 땅을 직접 바라볼 수 있는 전망대',
    goseongTowerName: '고성통일전망타워',
    goseongTower: '통일을 염원하는 의미의 대표적 전망 명소',
    dmzMuseumName: 'DMZ 박물관',
    dmzMuseum: '분단과 전쟁 역사를 전시하는 교육적 공간',
    
    // e스포츠 장소들
    lolParkName: '롤파크',
    lolPark: 'LCK 공식 경기장 + 팬샵 & 전시 공간 포함',
    esportsHallName: '이스포츠 명예의 전당',
    esportsHall: '한국 e스포츠 역사와 선수 업적을 전시하는 공간',
    netmarbleMuseumName: '넷마블게임박물관',
    netmarbleMuseum: '게임 역사와 문화를 체험할 수 있는 박물관',
    t1BuildingName: 'T1',
    t1Building: 'T1 사옥 - 세계 최고의 e스포츠 팀 T1의 본사',
    inspireArenaName: '인스파이어 아레나',
    inspireArena: '국제 e스포츠 대회 개최지',
    hikrGroundName: '하이커 그라운드',
    hikrGround: 'K-콘텐츠와 e스포츠를 체험할 수 있는 복합 문화공간',
    
    // 전통시장 장소들
    gwangjangMarketName: '광장시장',
    gwangjangMarket: '빈대떡·육회 등 한국식 길거리 음식을 맛볼 수 있는 대표 시장',
    namdaemunMarketName: '남대문시장',
    namdaemunMarket: '한국 최대 규모의 전통시장',
    tonginMarketName: '통인시장',
    tonginMarket: '도시락 카페 체험이 가능한 독특한 시장',
    mangwonMarketName: '망원시장',
    mangwonMarket: '젊은 층과 외국인에게 인기 있는 생활형 시장',
    noryangjinMarketName: '노량진 수산물 도매시장',
    noryangjinMarket: '활어와 해산물 거래가 활발한 한국 대표 수산시장',
    
    // 서울 전망 장소들
    nSeoulTowerSkylineName: 'N서울타워',
    nSeoulTowerSkylineDesc: '서울의 중심이자 심장 같은 존재로 상징되는 랜드마크',
    lotteWorldTowerName: '롯데월드타워',
    lotteWorldTower: '초고층에서 서울 전경을 내려다볼 수 있는 전망대',
    square63Name: '63스퀘어',
    sixtyThreeSquare: '한강과 서울 도심을 한눈에 볼 수 있는 전망대',
    sebitIslandName: '세빛섬',
    sebitIsland: '한강 위의 인공 섬, 야경 포토존 명소',
    bukhanMountainName: '북한산국립공원',
    bukhansanPark: '서울 전체를 조망할 수 있는 최고의 전망 명소',
    
    // 명산 장소들
    seorakMountainName: '설악산 국립공원',
    seoraksan: '한국을 대표하는 국립공원, 울산바위·권금성 등 명소 포함',
    jiriMountainName: '지리산 국립공원',
    jirisan: '한반도 최초의 국립공원, 천왕봉에서 바라보는 일출 유명',
    hallaMountainName: '한라산 국립공원',
    hallasan: '대한민국 최고봉(1950m), 백록담 분화구 호수 명소',
    bukhansan: '서울 접근성 최고, 외국인 관광객 인기 1위 등산지',
    mudungMountainName: '무등산',
    mudungsan: '남도의 상징적 명산, 천연 암석기둥 \'입석대\'로 유명',
    
    // K-POP MV 장소들
    garosuGil: '패션·카페·아트가 공존하는 거리. K-POP 뮤비와 화보에 자주 등장하며, 골목마다 감각적인 포토 스폿이 이어집니다.',
    starfieldCoex: '별마당도서관과 초대형 미디어월로 유명한 도심 랜드마크. 걸그룹 프로모션·콘텐츠 촬영 배경으로 자주 쓰이는 핫플입니다.',
    hangangBridge: '한강 야경과 교량 라인이 만들어내는 시그니처 뷰. 아이돌 뮤비·퍼포먼스 영상에서 상징적인 배경으로 사랑받습니다.',
    apgujeongRodeo: '패션과 음악 트렌드의 중심지. 네온 사인과 쇼윈도가 어우러진 스트리트 무드가 콘셉트 촬영에 제격입니다.',
    
    // 팁들
    dmzTips: ['가을 단풍 시즌 최고의 명산', '울산바위와 권금성 필수 방문'],
    esportsTips: ['LCK 경기 일정 확인 필수', '팬샵에서 굿즈 구매 가능'],
    marketTips: ['아침 시간대가 가장 활기참', '현금 준비 필수'],
    skylineTips: ['일몰 시간대 방문 추천', '야경 포토존 활용'],
    mountainTips: ['등산 준비물 필수', '날씨 확인 후 방문'],
    kpopTips: ['팬미팅 일정 확인', '사진 촬영 포인트 미리 파악'],
    
    // 기타
    themeRecommendation: '테마 여행지 추천',
    startTheme: '테마 시작',
    
    // Hero 섹션
    natureTitle: '자연으로의 초대',
    natureSub: '산·바다·섬을 한 번에',
    cityTitle: '도심 속 힐링 스팟',
    citySub: '가까운 곳부터 가볍게',
    historyTitle: '시간여행',
    historySub: '역사 속으로',
    festivalTitle: '축제의 계절',
    festivalSub: '지금 즐기기 좋은',
    
    // 메인 Hero
    mainTitle: 'Hello Korea',
    mainSubtitle: '여행지 테마 제공 및 유명지역 추천 서비스',
    
    // Footer
    footerDescription: '국내 여행 아이디어를 한 곳에서.',
    footerEmail: '0523jeman@naver.com',
    footerGuide: '안내',
    footerTerms: '이용약관',
    footerPrivacy: '개인정보처리방침',
    footerTermsTitle: '이용약관',
    footerPrivacyTitle: '개인정보처리방침',
    footerTermsContent: `
      <p><strong>제1조(목적)</strong> 본 약관은 Hello Korea(이하 '당사')가 제공하는 서비스 이용과 관련하여 당사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
      <p><strong>제2조(정의)</strong> '이용자'란 당사의 서비스에 접속하여 본 약관에 따라 당사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</p>
      <p><strong>제3조(약관의 효력 및 변경)</strong> 당사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시 공지사항을 통해 안내합니다.</p>
      <p><strong>제4조(서비스의 제공 및 변경)</strong> 당사는 서비스의 내용, 운영 정책을 변경할 수 있으며, 변경 시 사전 고지합니다.</p>
      <p><strong>제5조(이용자의 의무)</strong> 이용자는 관계 법령 및 약관을 준수해야 하며, 서비스의 안정적 운영을 방해해서는 안 됩니다.</p>
      <p><strong>제6조(책임의 제한)</strong> 당사는 천재지변, 제3자의 귀책 등 불가항력으로 인한 서비스 장애에 대하여 책임을 지지 않습니다.</p>
    `,
    footerPrivacyContent: `
      <p><strong>1. 수집하는 개인정보 항목</strong> 이메일, 닉네임 등 서비스 제공에 필요한 최소한의 정보</p>
      <p><strong>2. 개인정보의 이용 목적</strong> 회원관리, 서비스 개선 및 고객 문의 대응</p>
      <p><strong>3. 보유 및 이용기간</strong> 관련 법령에 의한 보존 기간 또는 이용 목적 달성 시까지</p>
      <p><strong>4. 제3자 제공</strong> 법령에 의한 경우를 제외하고 사전 동의 없이 제공하지 않습니다.</p>
      <p><strong>5. 이용자의 권리</strong> 개인정보 열람·정정·삭제 요청이 가능하며, 고객센터를 통해 문의할 수 있습니다.</p>
    `,
    footerCustomer: '고객센터',
    footerHours: '평일 09:00 ~ 18:00',
    
    // 스케줄 관리
    scheduleManagement: '스케줄 관리',
    schedule: '스케줄',
    addSchedule: '일정 추가',
    editSchedule: '일정 편집',
    deleteSchedule: '일정 삭제',
    scheduleCount: '개 일정',
    timeDistribution: '시간대별 분포',
    noScheduleData: '스케줄 데이터가 없습니다',
    totalHours: '총 시간',
    totalDuration: '총 소요시간',
    noSchedule: '일정이 없습니다',
    addNewSchedule: '새로운 일정을 추가해보세요',
    startTime: '시작 시간',
    endTime: '종료 시간',
    placeActivity: '장소/활동명',
    placePlaceholder: '예: 강남역, 롯데월드타워',
    category: '카테고리',
    memo: '메모 (선택사항)',
    memoPlaceholder: '추가 정보나 메모를 입력하세요',
    previous: '이전',
    next: '다음',
    displayCount: '표시 개수',
    items: '개',
    loadingSchedule: '스케줄을 불러오는 중...',
    errorOccurred: '오류 발생:',
    enterTime: '시간을 입력해주세요',
    enterPlaceActivity: '장소/활동명을 입력해주세요',
    loadingNearbyInfo: '주변 정보를 불러오는중...',
    noNearbyPlaces: '주변 장소 API를 호출할 수 없습니다.',
    invalidTimeFormat: '올바른 시간 형식이 아닙니다 (HH:MM)',
    endTimeAfterStart: '종료 시간은 시작 시간보다 늦어야 합니다',
    reviews: '리뷰',
    loadingPlaceInfo: '장소 정보를 불러오는 중...',
    
    // 스케줄 카테고리
    tourism: '관광',
    dining: '식사',
    shopping: '쇼핑',
    transportation: '교통',
    accommodation: '숙박',
    culturalFacility: '문화시설',
    etc: '기타',
    
    // 다운로드/공유
    excelDownload: '엑셀 다운로드',
    pngDownload: 'PNG 다운로드',
    jpgDownload: 'JPG 다운로드',
    share: '공유하기',
    
    // 스케줄 상태
    progressStatus: '진행 상황',
    scheduleStatus: '스케줄',
    
    // 공통 버튼
    cancel: '취소',
    save: '저장',
    
    // 스케줄 날짜 선택 모달
    scheduleDateSelection: '스케줄 날짜 선택',
    selectDateForSchedule: '{{placeName}}을(를) 스케줄에 추가할 날짜를 선택해주세요.',
    selectDate: '날짜 선택',
    goToSchedulePage: '스케줄 페이지로 이동',
    locale: 'ko',
    
    // K-POP Demon Hunters 테마
    kpopDemonHunters: 'K-POP Demon Hunters 테마',
    kpopDemonHuntersDescription: 'K-POP Demon Hunters 영화의 촬영지를 따라가는 특별한 팬 투어',
    
    // K-POP Demon Hunters 장소들
    coexKpopPlaza: '코엑스 K-POP 광장 & 3D 전광판',
    coexKpopPlazaDesc: '헌트릭스의 신곡 티저가 공개된 상징적인 3D 전광판',
    naksanPark: '낙산공원',
    naksanParkDesc: '루미와 지누가 서울 성벽을 따라 걷는 감성적인 장소',
    cheongdamBridge: '청담대교 & 자양역',
    cheongdamBridgeDesc: '한강을 가로지르는 지하철 위에서 펼쳐지는 액션 장면의 배경',
    nSeoulTower: 'N서울타워',
    nSeoulTowerDesc: '서울의 중심이자 심장 같은 존재로 상징되는 랜드마크',
    jamsilOlympicStadium: '잠실올림픽주경기장',
    jamsilOlympicStadiumDesc: '3명의 주인공들이 데뷔 무대를 펼친 폭발적인 오프닝 장소',
    myeongdongStreet: '명동거리',
    myeongdongStreetDesc: '사자보이즈가 팬들과 Soda Pop을 공연한 현란한 네온사인 거리',
    
    // 역사적인 장소 테마
    historicalSites: '역사적인 장소 테마',
    historicalSitesDescription: '조선왕조부터 대한제국까지, 한국 역사의 중심을 체험하는 특별한 여행',
    
    // 역사적인 장소들
    gyeongbokgung: '경복궁',
    gyeongbokgungDesc: '조선왕조의 정궁으로 한국 전통 건축의 백미',
    sungnyemun: '숭례문',
    sungnyemunDesc: '서울의 남대문으로 조선왕조의 상징적 건축물',
    changdeokgung: '창덕궁',
    changdeokgungDesc: '유네스코 세계문화유산으로 조선왕조의 대표 궁궐',
    jongmyo: '종묘',
    jongmyoDesc: '조선왕조 역대 임금들의 신위를 모신 사당',
    deoksugung: '덕수궁',
    deoksugungDesc: '대한제국 황궁으로 근대사의 중심지',
    
    // K-POP MV 촬영지 테마
    kpopMvLocations: 'K-POP 아티스트 뮤비촬영지 테마',
    kpopMvLocationsDescription: '인기 K-POP 아티스트들의 기록을 따라가보세요',
    
    // K-POP MV 장소들
    jejuSagyeBeach: '제주 사계해변',
    jejuSagyeBeachDesc: 'BTS의 일본 싱글 뮤직비디오 \'For You\' 촬영지로, 낮에는 푸른 바다와 한라산의 조화가, 노을 질 무렵에는 드라마틱한 감성을 느낄 수 있어 팬들의 성지로 꼽힙니다.',
    incheonSongdoTribowl: '인천 송도 트라이보울',
    incheonSongdoTribowlDesc: '도심 속 미래형 건축물인 트라이보울은 EXO의 겨울 감성 뮤비 \'Miracles in December\'에서 등장합니다. 낮에는 구조미, 밤에는 조명과 함께한 분위기가 예술적 감성을 더해줍니다.',
    seoulBukchonHanok: '서울 북촌 한옥마을',
    seoulBukchonHanokDesc: '아이유의 \'밤편지\' 뮤비는 서울 북촌의 한옥에서 촬영되었습니다. 조용하고 고즈넉한 분위기에서 한국 전통의 미와 감성을 모두 느낄 수 있습니다.',
    gyeongjuHwanglidan: '경주 황리단길',
    gyeongjuHwanglidanDesc: '전통과 현대가 어우러진 감성 거리, 황리단길은 세븐틴의 뮤직비디오 \'Darl+ing\' 촬영지입니다. 아기자기한 카페와 셀프 포토존이 많아, 뮤비 속 한 장면처럼 인생샷을 남기기에 제격입니다.',
    gangneungGyeongpoBeach: '강릉 경포대 해변',
    gangneungGyeongpoBeachDesc: '태연의 \'사계\' 뮤직비디오는 사계절의 정서를 아름답게 표현한 곡답게, 동해 바다의 다양한 색을 담아냈습니다. 강릉 경포해변은 조용한 감성 여행과 사진 촬영 모두에 적합한 명소입니다.',
    
    // Coming Soon 테마
    comingSoon: '더 많은 테마가 추가될 예정입니다.',
    comingSoonDescription: '더 많은 특별한 테마들이 곧 추가될 예정입니다',
    
    
    // 전국 추천 페이지
    nationwideTitle: '전국의 추천 여행지',
    nationwideSubtitle: '전국 곳곳의 인기있는 여행지를 만나보세요',
    popularDestinations: '인기 여행지',
    nationwideDescription: '지역별로 평점/리뷰를 기반으로 한 추천을 받아보세요',
    
    // 상세정보 페이지
    businessStatus: '영업중',
    businessHours: '영업시간',
    description: '설명',
    googleReviews: 'Google 리뷰 분포',
    totalReviews: '전체 리뷰',
    hideReviews: '리뷰 숨기기',
    relevanceOrder: '관련성순',
    latestOrder: '최신순',
    photos: '사진',
    viewMoreOnGoogleMaps: 'Google Maps에서 더 많은 리뷰와 사진 보기',
    viewReviews: '리뷰 보기',
    nearbyRestaurants: '주변 맛집 & 숙소',
    restaurants: '맛집',
    accommodations: '숙소',
    morePlaces: '더 보기',
    moreCount: '개 더',
    localGuide: '지역 가이드',
    temporarilyClosed: '임시휴업',
    permanentlyClosed: '영구폐업',
    website: '웹사이트',
    copyAddress: '주소 복사',
    details: '상세정보',
    phoneNumber: '전화번호',
    addToSchedule: '스케줄에 추가',
    viewOnGoogleMaps: 'Google Maps에서 보기',
    tipCheckHours: '방문 전 전화로 영업시간 확인',
    tipTransport: '주차 시설 및 대중교통 정보 확인',
    tipWeather: '날씨에 따른 준비물 체크',
    
    // MyPage
    likedPlaces: '좋아요한 여행지',
    recentViews: '최근 본 여행지',
    noRecentViews: '최근 본 여행지가 없습니다.',
    noLikedPlaces: '좋아요한 여행지가 없습니다.',
    noName: '이름 없음',
    editNickname: '닉네임 변경',
    passwordChange: '비밀번호 변경',
    deleteAccount: '회원탈퇴',
    calendar: '달력',
    darkMode: '다크모드',
    darkModeOn: '다크모드 켜기',
    darkModeOff: '다크모드 끄기',
    today: '오늘',
    selectedDate: '선택된 날짜',
    otherMonth: '다른 달',
    loggingIn: '로그인 중...',
    loginFailed: '로그인에 실패했습니다.',
    signup: '회원가입',
    signingUp: '가입 중...',
    signupFailed: '회원가입에 실패했습니다.',
    email: '이메일',
    password: '비밀번호',
    noAccount: '계정이 없으신가요?',
    haveAccount: '이미 계정이 있으신가요?',
    optional: '선택',
    saving: '저장 중...',
    change: '변경',
    nickname: '닉네임',
    enterNickname: '닉네임을 입력하세요',
    currentPassword: '현재 비밀번호',
    enterCurrentPassword: '현재 비밀번호를 입력하세요',
    newPassword: '새 비밀번호',
    enterNewPassword: '새 비밀번호를 입력하세요',
    confirmNewPassword: '새 비밀번호 확인',
    reenterNewPassword: '새 비밀번호를 다시 입력하세요',
    // 모달/공통 라벨
    detailInfo: '상세 정보',
    quickActions: '빠른 액션',
    travelTips: '여행 팁',
    close: '닫기',
    
    // 페이지네이션
    page: '페이지',
    of: '중',
    
    // 지역명
    region: {
      '전국': '전국',
      '서울': '서울',
      '부산': '부산',
      '대구': '대구',
      '인천': '인천',
      '광주': '광주',
      '대전': '대전',
      '울산': '울산',
      '세종': '세종',
      '경기': '경기',
      '강원': '강원',
      '충북': '충북',
      '충남': '충남',
      '전북': '전북',
      '전남': '전남',
      '경북': '경북',
      '경남': '경남',
      '제주': '제주'
    },
    
    // 지역 선택
    expandList: '목록 펼치기',
    collapseList: '목록 접기',
    
  }
};

// 영어 번역
const en = {
  translation: {
    // 공통
    home: 'Home',
    login: 'Login',
    logout: 'Logout',
    mypage: 'My Page',
    mySchedule: 'My Schedule',
    search: 'Search',
    searchPlaceholder: 'Search for travel destinations',
    loading: 'Loading...',
    user: 'User',
    
    // 네비게이션
    nationwide: 'Nationwide Travel Spots',
    myInfo: 'My Info',
    
    // K-Culture 테마
    kCulture: 'K-Culture Themes',
    kCultureDescription: 'Discover the true charm of Korea through history, nature, and modern culture',
    
    // 테마들
    dmzHistory: 'DMZ & Division History Theme',
    dmzHistoryDescription: 'Historical experience course reflecting on the meaning of peace by visiting the sites of division',
    esports: 'eSports Theme',
    esportsDescription: 'Special tour experiencing the growth and culture of Korean eSports',
    traditionalMarket: 'Traditional Market Theme',
    traditionalMarketDescription: 'Authentic local cultural experience in Korea\'s traditional markets',
    seoulSkyline: 'Seoul City Skyline Theme',
    seoulSkylineDescription: 'Scenic spots where you can enjoy Seoul\'s beautiful skyline',
    koreanMountains: 'Korean Mountains & Nature Theme',
    koreanMountainsDescription: 'Nature experience theme exploring Korea\'s representative national parks and famous mountains',
    kpopMv: 'K-POP Music Video Filming Locations Theme',
    kpopMvDescription: 'Theme following filming locations of representative K-POP artists',
    
    // 장소 정보
    estimatedTime: 'Estimated Time',
    minutes: 'min',
    hours: 'h',
    address: 'Address',
    tips: 'Tips',
    viewOnMap: 'View on Map',
    viewDetail: 'View Details',
    
    // 언어 변경
    language: 'English',
    korean: '한국어',
    english: 'English',
    changeLanguage: 'Change Language',
    
    // 장소 설명들
    thirdTunnelName: 'Third Tunnel',
    thirdTunnelDesc: 'Place where you can directly experience the tension of North-South confrontation',
    imjingakName: 'Imjingak Peace Park',
    imjingak: 'Representative tourist site symbolizing the reality of division and peace',
    dorasanName: 'Dorasan Observatory',
    dorasan: 'Observatory where you can directly view North Korean territory',
    goseongTowerName: 'Goseong Unification Observatory',
    goseongTower: 'Representative scenic spot symbolizing the meaning of wishing for unification',
    dmzMuseumName: 'DMZ Museum',
    dmzMuseum: 'Educational space exhibiting the history of division and war',

    // Traditional Markets - names
    gwangjangMarketName: 'Gwangjang Market',
    namdaemunMarketName: 'Namdaemun Market',
    tonginMarketName: 'Tongin Market',
    mangwonMarketName: 'Mangwon Market',
    noryangjinMarketName: 'Noryangjin Fish Market',

    // eSports - names
    lolParkName: 'LoL Park',
    esportsHallName: 'eSports Hall of Fame',
    netmarbleMuseumName: 'Netmarble Game Museum',
    t1BuildingName: 'T1 Headquarters',
    inspireArenaName: 'Inspire Arena',
    hikrGroundName: 'HiKR Ground',

    // Seoul Skyline - names
    nSeoulTowerSkylineName: 'N Seoul Tower',
    nSeoulTowerSkylineDesc: 'A landmark symbolizing the center and heart of Seoul',
    lotteWorldTowerName: 'Lotte World Tower',
    square63Name: '63 Square',
    sebitIslandName: 'Sebitseom Island',
    bukhanMountainName: 'Bukhansan National Park',

    // Korean Mountains - names
    seorakMountainName: 'Seoraksan National Park',
    jiriMountainName: 'Jirisan National Park',
    hallaMountainName: 'Hallasan National Park',
    taebaekMountainName: 'Taebaeksan National Park',
    mudungMountainName: 'Mudeungsan National Park',
    
    // e스포츠 장소들
    lolPark: 'LCK official stadium + fan shop & exhibition space included',
    esportsHall: 'Space exhibiting the history and achievements of Korean eSports players',
    netmarbleMuseum: 'Museum where you can experience game history and culture',
    t1Building: 'T1 headquarters - home of T1, the world\'s best eSports team',
    inspireArena: 'International eSports tournament venue',
    hikrGround: 'Complex cultural space where you can experience K-content and eSports',
    
    // 전통시장 장소들
    gwangjangMarket: 'Representative of Korean traditional markets, various food and shopping',
    namdaemunMarket: 'Seoul\'s representative traditional market, operates 24 hours',
    tonginMarket: 'Seoul\'s representative traditional market, operates 24 hours',
    mangwonMarket: 'Trendy traditional market preferred by young people',
    noryangjinMarket: 'Wholesale market where you can taste fresh seafood and live fish',
    
    // 서울 전망 장소들
    lotteWorldTower: 'Observatory where you can view Seoul\'s entire landscape from high altitude',
    sixtyThreeSquare: 'Observatory where you can see the Han River and Seoul city center at a glance',
    sebitIsland: 'Artificial island on the Han River, famous night view photo spot',
    bukhansanPark: 'Best scenic spot where you can view all of Seoul',
    
    // 명산 장소들
    seoraksan: 'Korea\'s representative national park, includes famous spots like Ulsan Rock and Gwongeumseong',
    jirisan: 'Korea\'s first national park, famous for sunrise views from Cheonwangbong Peak',
    hallasan: 'Korea\'s highest peak (1950m), famous for Baengnokdam crater lake',
    bukhansan: 'Best accessibility from Seoul, #1 popular hiking spot for foreign tourists',
    mudungsan: 'Symbolic mountain of the southern region, famous for natural rock pillar \'Ipseokdae\'',
    
    // K-POP MV 장소들
    garosuGil: 'Filming background for various artists including BTS',
    starfieldCoex: 'Famous filming location for girl group music videos',
    hangangBridge: 'Symbolic background for idol music videos',
    apgujeongRodeo: 'Filming spot where fashion and music meet',
    
    // 팁들
    dmzTips: ['Best mountain during autumn foliage season', 'Must visit Ulsan Rock and Gwongeumseong'],
    esportsTips: ['Check LCK match schedule', 'Purchase goods at fan shop'],
    marketTips: ['Most lively during morning hours', 'Cash preparation required'],
    skylineTips: ['Recommended visit during sunset', 'Utilize night view photo zones'],
    mountainTips: ['Hiking equipment required', 'Check weather before visiting'],
    kpopTips: ['Check fan meeting schedule', 'Identify photo spots in advance'],
    
    // 기타
    themeRecommendation: 'Theme Recommendation',
    startTheme: 'Start Theme',
    
    // Hero 섹션
    natureTitle: 'Invitation to Nature',
    natureSub: 'Mountains, seas, and islands all in one',
    cityTitle: 'Healing Spots in the City',
    citySub: 'Start from nearby places',
    historyTitle: 'Time Travel',
    historySub: 'Into the past',
    festivalTitle: 'Season of Festivals',
    festivalSub: 'Perfect for now',
    
    // 메인 Hero
    mainTitle: 'Hello Korea',
    mainSubtitle: 'Travel theme recommendations and famous regional spot services',
    
    // Footer
    footerDescription: 'Domestic travel ideas in one place.',
    footerEmail: '0523jeman@naver.com',
    footerGuide: 'Guide',
    footerTerms: 'Terms of Service',
    footerPrivacy: 'Privacy Policy',
    footerTermsTitle: 'Terms of Service',
    footerPrivacyTitle: 'Privacy Policy',
    footerTermsContent: `
      <p><strong>Article 1 (Purpose)</strong> These terms define the rights, obligations, and responsibilities between Hello Korea (the 'Company') and users regarding the use of services provided by the Company.</p>
      <p><strong>Article 2 (Definitions)</strong> 'User' means members and non-members who access the Company's services and use them in accordance with these terms.</p>
      <p><strong>Article 3 (Effect and Changes)</strong> The Company may amend these terms within the scope not violating applicable laws and will notify users via announcements.</p>
      <p><strong>Article 4 (Provision and Changes of Services)</strong> The Company may change the content and policies of the services and will provide prior notice.</p>
      <p><strong>Article 5 (User Obligations)</strong> Users must comply with relevant laws and these terms and must not interfere with the stable operation of the services.</p>
      <p><strong>Article 6 (Limitation of Liability)</strong> The Company is not responsible for service failures caused by force majeure such as natural disasters or third-party faults.</p>
    `,
    footerPrivacyContent: `
      <p><strong>1. Information Collected</strong> Minimum information necessary for service provision such as email and nickname</p>
      <p><strong>2. Purpose of Use</strong> For member management, service improvement, and customer inquiries</p>
      <p><strong>3. Retention Period</strong> Until the purpose is fulfilled or according to the statutory retention period</p>
      <p><strong>4. Third-Party Provision</strong> Not provided to third parties without prior consent unless required by law.</p>
      <p><strong>5. User Rights</strong> Users may request access, correction, or deletion of personal information via customer support.</p>
    `,
    footerCustomer: 'Customer Service',
    footerHours: 'Weekdays 09:00 ~ 18:00',
    
    // 스케줄 관리
    scheduleManagement: 'Schedule Management',
    schedule: 'Schedule',
    addSchedule: 'Add Schedule',
    editSchedule: 'Edit Schedule',
    deleteSchedule: 'Delete Schedule',
    scheduleCount: 'schedules',
    timeDistribution: 'Time Distribution',
    noScheduleData: 'No schedule data available',
    totalHours: 'Total Hours',
    totalDuration: 'Total Duration',
    noSchedule: 'No schedules',
    addNewSchedule: 'Add a new schedule',
    startTime: 'Start Time',
    endTime: 'End Time',
    placeActivity: 'Place/Activity',
    placePlaceholder: 'e.g., Gangnam Station, Lotte World Tower',
    category: 'Category',
    memo: 'Memo (Optional)',
    memoPlaceholder: 'Enter additional information or notes',
    previous: 'Previous',
    next: 'Next',
    displayCount: 'Display Count',
    items: 'items',
    loadingSchedule: 'Loading schedules...',
    errorOccurred: 'Error occurred:',
    enterTime: 'Please enter time',
    enterPlaceActivity: 'Please enter place/activity name',
    loadingNearbyInfo: 'Loading nearby information...',
    noNearbyPlaces: 'Unable to call nearby places API.',
    invalidTimeFormat: 'Invalid time format (HH:MM)',
    endTimeAfterStart: 'End time must be later than start time',
    reviews: 'Reviews',
    loadingPlaceInfo: 'Loading place information...',
    
    // 스케줄 카테고리
    tourism: 'Tourism',
    dining: 'Dining',
    shopping: 'Shopping',
    transportation: 'Transportation',
    accommodation: 'Accommodation',
    culturalFacility: 'Cultural Facility',
    etc: 'Etc',
    
    // 다운로드/공유
    excelDownload: 'Excel Download',
    pngDownload: 'PNG Download',
    jpgDownload: 'JPG Download',
    share: 'Share',
    
    // 스케줄 상태
    progressStatus: 'Progress Status',
    scheduleStatus: 'Schedule',
    
    // 공통 버튼
    cancel: 'Cancel',
    save: 'Save',
    
    // 스케줄 날짜 선택 모달
    scheduleDateSelection: 'Schedule Date Selection',
    selectDateForSchedule: 'Please select a date to add {{placeName}} to your schedule.',
    selectDate: 'Select Date',
    goToSchedulePage: 'Go to Schedule Page',
    locale: 'en',
    
    // DetailPage 관련
    businessStatus: 'Business Status',
    businessHours: 'Business Hours',
    copyAddress: 'Copy Address',
    // MyPage
    likedPlaces: 'Liked Places',
    recentViews: 'Recently Viewed',
    noRecentViews: 'No recently viewed places.',
    noLikedPlaces: 'No liked places.',
    noName: 'No Name',
    editNickname: 'Edit Nickname',
    passwordChange: 'Change Password',
    deleteAccount: 'Delete Account',
    calendar: 'Calendar',
    darkMode: 'Dark Mode',
    darkModeOn: 'Dark Mode On',
    darkModeOff: 'Dark Mode Off',
    today: 'Today',
    selectedDate: 'Selected Date',
    otherMonth: 'Other Month',
    loggingIn: 'Logging in...',
    loginFailed: 'Login failed.',
    signup: 'Sign Up',
    signingUp: 'Signing up...',
    signupFailed: 'Signup failed.',
    email: 'Email',
    password: 'Password',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    optional: 'Optional',
    saving: 'Saving...',
    change: 'Change',
    nickname: 'Nickname',
    enterNickname: 'Enter your nickname',
    currentPassword: 'Current Password',
    enterCurrentPassword: 'Enter current password',
    newPassword: 'New Password',
    enterNewPassword: 'Enter new password',
    confirmNewPassword: 'Confirm New Password',
    reenterNewPassword: 'Re-enter new password',
    googleReviews: 'Google Reviews',
    reviewDistribution: 'Review Distribution',
    totalReviews: 'Total Reviews',
    hideReviews: 'Hide Reviews',
    relevanceOrder: 'Relevance',
    latestOrder: 'Latest',
    photos: 'Photos',
    viewMoreOnGoogleMaps: 'View more reviews and photos on Google Maps',
    nearbyRestaurants: 'Nearby Restaurants',
    nearbyAccommodations: 'Nearby Accommodations',
    restaurants: 'Restaurants',
    accommodations: 'Accommodations',
    temporarilyClosed: 'Temporarily Closed',
    permanentlyClosed: 'Permanently Closed',
    website: 'Website',
    // Modal/Common labels
    detailInfo: 'Details',
    phoneNumber: 'Phone Number',
    quickActions: 'Quick Actions',
    addToSchedule: 'Add to Schedule',
    viewOnGoogleMaps: 'View on Google Maps',
    travelTips: 'Travel Tips',
    tipCheckHours: 'Call ahead to confirm business hours',
    tipTransport: 'Check parking and public transport options',
    tipWeather: 'Prepare items according to the weather',
    close: 'Close',
    
    // K-POP Demon Hunters 테마
    kpopDemonHunters: 'K-POP Demon Hunters Theme',
    kpopDemonHuntersDescription: 'Special fan tour following filming locations from the K-POP Demon Hunters movie',
    
    // K-POP Demon Hunters 장소들
    coexKpopPlaza: 'COEX K-POP Plaza & 3D Billboard',
    coexKpopPlazaDesc: 'Iconic 3D billboard where Huntrix\'s new song teaser was revealed',
    naksanPark: 'Naksan Park',
    naksanParkDesc: 'Emotional location where Rumi and Jinu walk along Seoul\'s fortress walls',
    cheongdamBridge: 'Cheongdam Bridge & Jayang Station',
    cheongdamBridgeDesc: 'Background for action scenes unfolding on the subway crossing the Han River',
    nSeoulTower: 'N Seoul Tower',
    nSeoulTowerDesc: 'Landmark symbolizing the center and heart of Seoul',
    jamsilOlympicStadium: 'Jamsil Olympic Stadium',
    jamsilOlympicStadiumDesc: 'Explosive opening venue where the three protagonists performed their debut stage',
    myeongdongStreet: 'Myeongdong Street',
    myeongdongStreetDesc: 'Vibrant neon-lit street where Saja Boys performed Soda Pop with fans',
    
    // 역사적인 장소 테마
    historicalSites: 'Historical Sites Theme',
    historicalSitesDescription: 'Special journey experiencing the center of Korean history from the Joseon Dynasty to the Korean Empire',
    
    // 역사적인 장소들
    gyeongbokgung: 'Gyeongbokgung Palace',
    gyeongbokgungDesc: 'The main palace of the Joseon Dynasty, representing the pinnacle of Korean traditional architecture',
    sungnyemun: 'Sungnyemun Gate',
    sungnyemunDesc: 'Seoul\'s South Gate, a symbolic architectural structure of the Joseon Dynasty',
    changdeokgung: 'Changdeokgung Palace',
    changdeokgungDesc: 'UNESCO World Heritage Site and representative palace of the Joseon Dynasty',
    jongmyo: 'Jongmyo Shrine',
    jongmyoDesc: 'Shrine where the spirit tablets of all Joseon Dynasty kings are enshrined',
    deoksugung: 'Deoksugung Palace',
    deoksugungDesc: 'Imperial palace of the Korean Empire and center of modern history',
    
    // K-POP MV 촬영지 테마
    kpopMvLocations: 'K-POP Artist Music Video Filming Locations Theme',
    kpopMvLocationsDescription: 'Follow the footsteps of popular K-POP artists',
    
    // K-POP MV 장소들
    jejuSagyeBeach: 'Jeju Sagye Beach',
    jejuSagyeBeachDesc: 'Filming location for BTS\'s Japanese single music video \'For You\'. During the day, you can feel the harmony of the blue sea and Hallasan Mountain, and at sunset, you can experience a dramatic sensibility, making it a pilgrimage site for fans.',
    incheonSongdoTribowl: 'Incheon Songdo Tribowl',
    incheonSongdoTribowlDesc: 'Tribowl, a futuristic building in the city center, appears in EXO\'s winter emotional music video \'Miracles in December\'. During the day, its structural beauty, and at night, the atmosphere with lighting, add artistic sensibility.',
    seoulBukchonHanok: 'Seoul Bukchon Hanok Village',
    seoulBukchonHanokDesc: 'IU\'s \'Through the Night\' music video was filmed in a hanok (traditional Korean house) in Bukchon, Seoul. You can experience both the beauty and sensibility of Korean tradition in a quiet and serene atmosphere.',
    gyeongjuHwanglidan: 'Gyeongju Hwanglidan-gil',
    gyeongjuHwanglidanDesc: 'A sentimental street where tradition and modernity harmonize, Hwanglidan-gil is the filming location for SEVENTEEN\'s music video \'Darl+ing\'. With many charming cafes and self-photo zones, it\'s perfect for taking \'life shots\' like a scene from a music video.',
    gangneungGyeongpoBeach: 'Gangneung Gyeongpo Beach',
    gangneungGyeongpoBeachDesc: 'Taeyeon\'s \'Four Seasons\' music video, as befits a song that beautifully expresses the emotions of the four seasons, captures the diverse colors of the East Sea. Gangneung Gyeongpo Beach is a famous spot suitable for both quiet emotional travel and photography.',
    
    // Coming Soon 테마
    comingSoon: 'More themes will be added soon.',
    comingSoonDescription: 'More special themes will be added soon',
    
    
    // 전국 추천 페이지
    nationwideTitle: 'Nationwide Recommended Destinations',
    nationwideSubtitle: 'Discover popular travel destinations across the country',
    popularDestinations: 'Popular Destinations',
    nationwideDescription: 'Get recommendations based on ratings and reviews by region',
    
    // 상세정보 페이지
    viewReviews: 'View Reviews',
    
    
    // 페이지네이션
    of: 'of',
    
    // 지역명
    region: {
      '전국': 'Nationwide',
      '서울': 'Seoul',
      '부산': 'Busan',
      '대구': 'Daegu',
      '인천': 'Incheon',
      '광주': 'Gwangju',
      '대전': 'Daejeon',
      '울산': 'Ulsan',
      '세종': 'Sejong',
      '경기': 'Gyeonggi',
      '강원': 'Gangwon',
      '충북': 'Chungbuk',
      '충남': 'Chungnam',
      '전북': 'Jeonbuk',
      '전남': 'Jeonnam',
      '경북': 'Gyeongbuk',
      '경남': 'Gyeongnam',
      '제주': 'Jeju'
    },
    
    // 지역 선택
    expandList: 'Expand List',
    collapseList: 'Collapse List',
    
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko,
      en
    },
    fallbackLng: 'ko',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;






