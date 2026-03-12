/**
 * 한국관광공사 TourAPI 4.0 클라이언트 (KO/EN 지원)
 * KO: https://apis.data.go.kr/B551011/KorService2
 * EN: https://apis.data.go.kr/B551011/EngService2
 */

function getTourApiBaseUrl(lang?: string): string {
  if ((lang || '').toLowerCase().startsWith('en')) return 'https://apis.data.go.kr/B551011/EngService2';
  return 'https://apis.data.go.kr/B551011/KorService2';
}
const TOUR_API_KEY = process.env.TOUR_API_KEY || '';

export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface TourItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2: string;
  mapx: string;
  mapy: string;
  tel: string;
  firstimage: string;
  firstimage2: string;
  overview: string;
  cat1: string;
  cat2: string;
  cat3: string;
  areacode: string;
  sigungucode: string;
  createdtime: string;
  modifiedtime: string;
}


/**
 * 지역기반 관광지 목록 조회
 */
export async function getAreaBasedList(
  areaCode: string = '1', // 서울
  contentTypeId: string = '12', // 관광지
  numOfRows: number = 10,
  pageNo: number = 1,
  lang?: string
): Promise<TourItem[]> {
  const url = `${getTourApiBaseUrl(lang)}/areaBasedList2`;
  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    numOfRows: numOfRows.toString(),
    pageNo: pageNo.toString(),
    MobileOS: 'ETC',
    MobileApp: 'visitkorea',
    areaCode,
    contentTypeId,
    _type: 'json'
  });

  try {
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TourApiResponse<TourItem> = await response.json();
    
    if (data.response.header.resultCode !== '0000') {
      throw new Error(`API error: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items.item || [];
  } catch (error) {
    console.error('TourAPI areaBasedList error:', error);
    throw error;
  }
}

/**
 * 좌표반경 관광지 검색
 */
export async function getLocationBasedList(
  mapX: number,
  mapY: number,
  radius: number = 1000, // 1km
  contentTypeId: string = '12',
  numOfRows: number = 10,
  lang?: string
): Promise<TourItem[]> {
  const url = `${getTourApiBaseUrl(lang)}/locationBasedList2`;
  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    numOfRows: numOfRows.toString(),
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'visitkorea',
    mapX: mapX.toString(),
    mapY: mapY.toString(),
    radius: radius.toString(),
    contentTypeId,
    _type: 'json'
  });

  try {
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TourApiResponse<TourItem> = await response.json();
    
    if (data.response.header.resultCode !== '0000') {
      throw new Error(`API error: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items.item || [];
  } catch (error) {
    console.error('TourAPI locationBasedList error:', error);
    throw error;
  }
}


/**
 * 맛집 검색 (contentTypeId: 39)
 */
export async function getRestaurants(
  mapX: number,
  mapY: number,
  radius: number = 2000,
  numOfRows: number = 10,
  lang?: string
): Promise<TourItem[]> {
  return getLocationBasedList(mapX, mapY, radius, '39', numOfRows, lang);
}

/**
 * 숙소 검색 (contentTypeId: 32)
 */
export async function getAccommodations(
  mapX: number,
  mapY: number,
  radius: number = 2000,
  numOfRows: number = 10,
  lang?: string
): Promise<TourItem[]> {
  return getLocationBasedList(mapX, mapY, radius, '32', numOfRows, lang);
}

/**
 * 카페 검색 (contentTypeId: 39, cat2: A0502)
 */
export async function getCafes(
  mapX: number,
  mapY: number,
  radius: number = 2000,
  numOfRows: number = 10,
  lang?: string
): Promise<TourItem[]> {
  const url = `${getTourApiBaseUrl(lang)}/locationBasedList2`;
  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    numOfRows: numOfRows.toString(),
    pageNo: '1',
    MobileOS: 'ETC',
    MobileApp: 'visitkorea',
    mapX: mapX.toString(),
    mapY: mapY.toString(),
    radius: radius.toString(),
    contentTypeId: '39', // 음식점
    cat2: 'A0502', // 카페
    _type: 'json'
  });

  try {
    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TourApiResponse<TourItem> = await response.json();
    
    if (data.response.header.resultCode !== '0000') {
      throw new Error(`API error: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items.item || [];
  } catch (error) {
    console.error('TourAPI cafes error:', error);
    throw error;
  }
}
