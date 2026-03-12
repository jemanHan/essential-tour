import Fastify from "fastify";
import cors from "@fastify/cors";
import { textSearch, placeDetail, placePhoto, scorePlace } from "./placesClient.js";
import { mapPlace } from "./mappers/placeMapper.js";
import { MIN_RATING, MIN_REVIEWS } from "./config/reco.js";
import { prisma } from "@db/client";
import { authHook } from "./auth/jwt.js";
import { authRoutes } from "./routes/auth.js";
import { likesRoutes } from "./routes/likes.js";
import { recentViewsRoutes } from "./routes/recentViews.js";
import { usersRoutes } from "./routes/users.js";
import { placesRoutes } from "./routes/places.js";
import scheduleRoutes from "./routes/schedules.js";
import tourApiRoutes from "./routes/tourApi.js";
// import rateLimit from "@fastify/rate-limit"; // Temporarily disabled due to version mismatch

// 캐시 TTL 설정
const DETAIL_TTL = Number(process.env.DETAIL_TTL_MS || 604800000);

// 정적 데이터 - 한 번만 생성
// 전체 지역 목록 (검색에서 사용)
const ALL_REGIONS = [
	"전체","서울","부산","대구","인천","광주","대전","울산","세종",
	"경기","강원","충북","충남","전북","전남","경북","경남","제주",
	"수원","성남","고양","용인","부천","안산","안양","남양주",
	"화성","평택","의정부","시흥","파주","광명","김포","군포",
	"춘천","원주","강릉","속초","동해","태백","삼척",
	"청주","충주","제천","천안","공주","보령","아산","서산",
	"전주","군산","익산","정읍","남원","김제",
	"목포","여수","순천","나주","광양",
	"포항","경주","김천","안동","구미","영주","영천","상주","문경","경산",
	"창원","진주","통영","사천","김해","밀양","거제","양산"
];



export async function createApp() {
    const trustHops = Number(process.env.TRUST_PROXY_HOPS || 1);
    const app = Fastify({ logger: true, trustProxy: trustHops });
    app.register(cors as any, { 
        origin: ['https://hello-korea.link', 'https://www.hello-korea.link', 'http://localhost:5174', 'http://localhost:3000'], 
        methods: ['GET','HEAD','PUT','POST','PATCH','DELETE'], 
        allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept','Origin'], 
        credentials: true 
    });
    // Lightweight in-memory rate limit (fallback when @fastify/rate-limit is unavailable)
    const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 1000); // 1000회로 대폭 증가
    const RATE_LIMIT_WINDOW_MS = (() => {
        const w = String(process.env.RATE_LIMIT_WINDOW || '1 minute'); // 1분으로 복원
        if (w.includes('minute')) return 60_000;
        if (w.includes('second')) return 1_000;
        if (w.includes('hour')) return 3_600_000;
        const n = Number(w);
        return Number.isFinite(n) && n > 0 ? n : 60_000;
    })();
    type Counter = { count: number; resetAt: number };
    const ipCounters = new Map<string, Counter>();
    app.addHook('onRequest', async (req, reply) => {
        const url = req.url || '';
        // 적용 대상: API 경로만 (/api/*, /v1/*)
        if (!(url.startsWith('/api/') || url.startsWith('/v1/'))) return;
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
        const now = Date.now();
        const key = ip || 'unknown';
        let bucket = ipCounters.get(key);
        if (!bucket || now > bucket.resetAt) {
            bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
            ipCounters.set(key, bucket);
        }
        bucket.count += 1;
        if (bucket.count > RATE_LIMIT_MAX) {
            reply.header('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
            return reply.code(429).send({ error: 'Too Many Requests' });
        }
    });

	// Register auth hook globally, but allow public TMDB routes
	app.addHook('preHandler', (request, reply, done) => {
		if (request.url.startsWith('/api/tmdb')) {
			return done();
		}
		return (authHook as any)(request, reply, done);
	});
	
	// Register routes - v1으로 통일
	app.register(authRoutes, { prefix: '/v1' });
	app.register(likesRoutes, { prefix: '/v1' });
	app.register(recentViewsRoutes, { prefix: '/v1' });
	app.register(usersRoutes, { prefix: '/v1' });
	app.register(placesRoutes, { prefix: '/v1' });
	app.register(scheduleRoutes, { prefix: '/v1' });
	// 임시 호환: /api/v1 경로도 동일하게 제공 (구번들 지원)
	app.register(authRoutes, { prefix: '/api/v1' });
	app.register(likesRoutes, { prefix: '/api/v1' });
	app.register(recentViewsRoutes, { prefix: '/api/v1' });
	app.register(usersRoutes, { prefix: '/api/v1' });
	app.register(placesRoutes, { prefix: '/api/v1' });
	app.register(scheduleRoutes, { prefix: '/api/v1' });
	
	// 최적화된 캐시 시스템
	const requestCache = new Map<string, { data: any; timestamp: number }>();
	const photoCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();
	const regionCache = new Map<string, { data: any; timestamp: number }>(); // 지역별 데이터 캐시
	const CACHE_DURATION = 1800000; // 30분 캐시 (무한루프 방지)
	const PHOTO_CACHE_DURATION = 3600000; // 1시간 캐시 (사진은 더 오래)
	const REGION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 캐시 (지역 데이터)
	const MAX_CACHE_SIZE = 100; // 최대 캐시 항목 수
	const MAX_PHOTO_CACHE_SIZE = 50; // 최대 사진 캐시 항목 수
	const MAX_REGION_CACHE_SIZE = 20; // 최대 지역 캐시 항목 수

	// 캐시 크기 제한 함수 - 필요할 때만 호출
	function limitCacheSize() {
		if (requestCache.size > MAX_CACHE_SIZE) {
			const entries = Array.from(requestCache.entries());
			entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
			const toDelete = entries.slice(0, requestCache.size - MAX_CACHE_SIZE);
			toDelete.forEach(([key]) => requestCache.delete(key));
		}
	}

	// 사진 캐시 크기 제한 함수
	function limitPhotoCacheSize() {
		if (photoCache.size > MAX_PHOTO_CACHE_SIZE) {
			const entries = Array.from(photoCache.entries());
			entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
			const toDelete = entries.slice(0, photoCache.size - MAX_PHOTO_CACHE_SIZE);
			toDelete.forEach(([key]) => photoCache.delete(key));
		}
	}
	
	// 지역 캐시 크기 제한 함수
	function limitRegionCacheSize() {
		if (regionCache.size > MAX_REGION_CACHE_SIZE) {
			const entries = Array.from(regionCache.entries());
			entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
			const toDelete = entries.slice(0, regionCache.size - MAX_REGION_CACHE_SIZE);
			toDelete.forEach(([key]) => regionCache.delete(key));
		}
	}

	// Health check endpoints - 모든 경로 지원
	app.get("/health", async () => ({ ok: true }));
	app.get("/v1/health", async () => ({ ok: true }));
	app.get("/api/health", async () => ({ ok: true }));
	app.get("/api/v1/health", async () => ({ ok: true }));
	

	// Database endpoints
	app.get("/v1/db/users", async () => {
		try {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					email: true,
					displayName: true,
					lang: true,
					createdAt: true,
					_count: {
						select: {
							likes: true,
							itineraries: true
						}
					}
				}
			});
			return { success: true, data: users };
		} catch (error: any) {
			return { success: false, error: error?.message || 'Unknown error' };
		}
	});

	app.get("/v1/db/places", async () => {
		try {
			const places = await prisma.place.findMany({
				take: 50,
				orderBy: { id: 'desc' }
			});
			return { success: true, data: places };
		} catch (error: any) {
			return { success: false, error: error?.message || 'Unknown error' };
		}
	});

	app.get("/v1/db/likes", async () => {
		try {
			const likes = await prisma.userLike.findMany({
				include: {
					user: {
						select: { email: true, displayName: true }
					}
				},
				take: 50,
				orderBy: { createdAt: 'desc' }
			});
			return { success: true, data: likes };
		} catch (error: any) {
			return { success: false, error: error?.message || 'Unknown error' };
		}
	});

	// 최적화된 mapLite 함수
	function mapLite(p: any) {
		return {
			id: p.id,
			displayName: p.displayName,
			rating: p.rating,
			userRatingCount: p.userRatingCount,
			photos: p.photos,
			editorialSummary: p.editorialSummary,
			location: p.location,
			primaryType: p.primaryType,
			types: p.types,
			formattedAddress: p.formattedAddress // 지역 필터링을 위해 추가
		};
	}

	// 검색 API 핸들러 함수
	const searchHandler = async (req: any, reply: any) => {
		try {
			const { q, lat, lng, onlyTourism, minRating, minReviews, sort, region, page, limit, language: queryLanguage } = (req as any).query ?? {};
			const language = queryLanguage || req.headers['accept-language'] || 'ko';

			// Handle empty q parameter - default to "한국 관광지"
			const safeQ = String((q ?? "")).trim();
			const query = safeQ.length > 0 ? safeQ : "한국 관광지";
			
			// 지역별 캐시 키 생성 (언어 포함)
			const regionCacheKey = `region_${region || '전국'}_${query}_${language}`;
			
			// 지역 캐시 확인
			const now = Date.now();
			const cachedRegionData = regionCache.get(regionCacheKey);
			if (cachedRegionData && (now - cachedRegionData.timestamp) < REGION_CACHE_DURATION) {
				console.log(`📦 지역 캐시 사용: ${region || '전국'}`);
				const currentPage = Number(page ?? 1);
				const pageSize = Number(limit ?? 8);
				const startIndex = (currentPage - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedData = cachedRegionData.data.slice(startIndex, endIndex);
				
				return {
					data: paginatedData,
					pagination: {
						currentPage,
						pageSize,
						totalItems: cachedRegionData.data.length,
						totalPages: Math.ceil(cachedRegionData.data.length / pageSize),
						hasNext: endIndex < cachedRegionData.data.length,
						hasPrev: currentPage > 1
					}
				};
			}

			// 지역 필터가 있으면 스마트 매칭으로 검색
			let qBoosted = query;
			
			if (region && region !== "전국") {
				// 검색어에 지역 정보가 포함되어 있지 않은 경우에만 지역 추가
				const regionKeywords = [
					'서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
					'경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
					'수원', '성남', '의정부', '안양', '부천', '광명', '평택', '과천', '오산', '시흥', '군포', '의왕', '하남', '용인', '파주', '이천', '안성', '김포', '화성', '광주', '여주', '양평', '동두천', '가평', '연천',
					'춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양',
					'청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양',
					'천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안',
					'전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안',
					'목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안',
					'포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉',
					'창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천',
					'제주', '서귀포'
				];
				
				const hasRegionInQuery = regionKeywords.some(keyword => 
					query.toLowerCase().includes(keyword.toLowerCase())
				);
				
				if (!hasRegionInQuery) {
					qBoosted = `${region} ${query}`;
				} else {
					qBoosted = query; // 이미 지역 정보가 포함된 경우 그대로 사용
				}
			}

			// 페이지네이션 파라미터 처리
			const currentPage = Number(page ?? 1);
			const pageSize = Number(limit ?? 8);  // 프론트엔드 기본값 8개로 복원
			
			// 캐시 키 생성 (페이지 정보 제외 - 전체 결과를 캐시)
			const cacheKey = `${qBoosted}-${lat}-${lng}-${minRating}-${minReviews}-${sort}-${region}`;
			const cached = requestCache.get(cacheKey);
			
			// 캐시된 데이터가 있고 유효한 경우 페이지네이션 적용 후 반환
			if (cached && (now - cached.timestamp) < CACHE_DURATION) {
				const startIndex = (currentPage - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedData = cached.data.slice(startIndex, endIndex);
				return {
					data: paginatedData,
					pagination: {
						currentPage,
						pageSize,
						totalItems: cached.data.length,
						totalPages: Math.ceil(cached.data.length / pageSize),
						hasNext: endIndex < cached.data.length,
						hasPrev: currentPage > 1
					}
				};
			}

			// Call Google Places API - 더 많은 결과를 위해 다양한 검색어로 요청
			let allPlaces: any[] = [];
			const seenIds = new Set<string>(); // 중복 제거용
			const seenNames = new Set<string>(); // 이름 기반 중복 제거용
			
			// 기본 검색 - 페이지 크기에 맞춰 호출
			const data1: any = await textSearch(String(qBoosted || ""), lat ? Number(lat) : undefined, lng ? Number(lng) : undefined, pageSize, language);
			const places1 = Array.isArray(data1?.places) ? data1.places : Array.isArray(data1) ? data1 : [];
			places1.forEach((place: any) => {
				if (place.id && !seenIds.has(place.id)) {
					// 이름 기반 중복도 체크
					const placeName = place.displayName?.text || place.name || '';
					if (!seenNames.has(placeName)) {
						seenIds.add(place.id);
						seenNames.add(placeName);
						allPlaces.push(place);
					}
				}
			});
			
			// 추가 검색어로 더 많은 결과 확보
			if (region && region !== "전국") {
				// 단일 지역인 경우
				const additionalQueries = [
					`${region} 관광지`,
					`${region} 명소`, 
					`${region} 여행`,
					`${region} 공원`,
					`${region} 박물관`
				];
				
				for (const additionalQuery of additionalQueries) {
					if (allPlaces.length < 80) {
						try {
							const additionalData: any = await textSearch(additionalQuery, lat ? Number(lat) : undefined, lng ? Number(lng) : undefined, pageSize, language);
							const additionalPlaces = additionalData?.places ?? additionalData ?? [];
							additionalPlaces.forEach((place: any) => {
								if (place.id && !seenIds.has(place.id)) {
									seenIds.add(place.id);
									allPlaces.push(place);
								}
							});
						} catch (err) {
							break;
						}
					}
				}
			} else {
				// 전체 검색일 때
				const additionalQueries = [
					`한국 여행지`,
					`한국 명소`,
					`대한민국 관광`,
					`한국 관광지`,
					`서울 관광지`,
					`부산 관광지`, 
					`제주도 관광지`,
					`경주 관광지`
				];
				
				for (const additionalQuery of additionalQueries) {
					if (allPlaces.length < 120) {
						try {
							const additionalData: any = await textSearch(additionalQuery, lat ? Number(lat) : undefined, lng ? Number(lng) : undefined, pageSize, language);
							const additionalPlaces = additionalData?.places ?? additionalData ?? [];
							additionalPlaces.forEach((place: any) => {
								if (place.id && !seenIds.has(place.id)) {
									seenIds.add(place.id);
									allPlaces.push(place);
								}
							});
						} catch (err) {
							break;
						}
					}
				}
			}
			
			// 중복 제거 (ID 기준)
			const uniquePlaces = allPlaces.filter((place, index, self) => 
				index === self.findIndex(p => p.id === place.id)
			);
			
			// Map the data
			let arr = uniquePlaces.map(mapLite);

		// Apply rating and review filters
		const mr = Number(minRating ?? MIN_RATING);
		const mv = Number(minReviews ?? MIN_REVIEWS);
		arr = arr.filter((p: any) => (p.rating ?? 0) >= mr && (p.userRatingCount ?? 0) >= mv);
		
		// 관광지 필터링 비활성화 (임시)

		// 지역 필터링 완전 제거 - 모든 지역에서 충분한 결과 제공
		// 지역별 필터링을 제거하여 관광지가 적은 지역도 충분한 결과 표시

			// Apply sorting
			const s = String(sort ?? "score");
			try {
				if (s === "score") arr.sort((a: any, b: any) => scorePlace(b) - scorePlace(a));
				else if (s === "rating") arr.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
				else if (s === "reviews") arr.sort((a: any, b: any) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0));
			} catch (sortError) {
				// 무한루프 방지를 위해 로그 제거
			}

			// Limit results - 더 많은 결과 제공 (캐시용)
			arr = arr.slice(0, 200);  // 100개에서 200개로 증가

			// 결과를 캐시에 저장하고 크기 제한
			requestCache.set(cacheKey, { data: arr, timestamp: now });
			limitCacheSize();

			// 지역 캐시에 저장 (24시간 캐시)
			regionCache.set(regionCacheKey, { data: arr, timestamp: now });
			limitRegionCacheSize();
			console.log(`💾 지역 캐시 저장: ${region || '전국'} (${arr.length}개 항목)`);

			// 페이지네이션 적용
			const startIndex = (currentPage - 1) * pageSize;
			const endIndex = startIndex + pageSize;
			const paginatedData = arr.slice(startIndex, endIndex);

			return {
				data: paginatedData,
				pagination: {
					currentPage,
					pageSize,
					totalItems: arr.length,
					totalPages: Math.ceil(arr.length / pageSize),
					hasNext: endIndex < arr.length,
					hasPrev: currentPage > 1
				}
			};
		} catch (error) {
			console.error("Search error:", error);
			return reply.code(500).send({ error: "Search failed", message: String(error) });
		}
	};

	// 최적화된 검색 API - v1과 api/v1 모두 지원
	app.get("/v1/search", searchHandler);
	app.get("/api/v1/search", searchHandler);

	// Places API - v1과 api/v1 모두 지원
	const placesHandler = async (req: any, reply: any) => {
		const { id } = req.params as any;
		const { language: queryLanguage } = (req as any).query ?? {};
		const language = queryLanguage || req.headers['accept-language'] || 'ko';
		
		// 상세정보 캐시 키 생성 (언어 포함)
		const detailCacheKey = `detail-${id}-${language}`;
		const now = Date.now();
		const cachedDetail = requestCache.get(detailCacheKey);
		
		// 캐시된 상세정보가 있고 유효한 경우 반환
		if (cachedDetail && (now - cachedDetail.timestamp) < CACHE_DURATION) {
			return cachedDetail.data;
		}
		
		try {
			const raw = await placeDetail(String(id), language);
			const mappedPlace = mapPlace(raw);
			
			// 상세정보를 캐시에 저장
			requestCache.set(detailCacheKey, { data: mappedPlace, timestamp: now });
			limitCacheSize();
			
			return mappedPlace;
		} catch (e: any) {
			const msg = String(e?.message || e);
			
			const m = msg.match(/^UPSTREAM_(\d{3}):/);
			if (m) {
				const code = Number(m[1]);
				const body = msg.substring(msg.indexOf(':') + 1).substring(0, 300); // First 300 chars
				return reply.code(code).send({ error: "UpstreamError", status: code, message: body });
			}
			return reply.code(500).send({ error: "Internal", message: msg });
		}
	};

	// Places API 라우트 등록 - v1과 api/v1 모두 지원
	app.get("/v1/places/:id", placesHandler);
	app.get("/api/v1/places/:id", placesHandler);

	// Photos API 라우트 등록 - v1과 api/v1 모두 지원
	app.get("/v1/places/:id/photos/media", async (req, reply) => {
		const { id } = (req as any).params;
		const { name, maxWidthPx } = (req as any).query ?? {};
		if (!name) {
			reply.status(400).send({ error: "name parameter is required" });
			return;
		}
		const w = maxWidthPx ? Number(maxWidthPx) : 1200;
		
		// 사진 캐시 키 생성
		const photoCacheKey = `${id}-${name}-${w}`;
		const now = Date.now();
		const cachedPhoto = photoCache.get(photoCacheKey);
		
		// 캐시된 사진이 있고 유효한 경우 반환
		if (cachedPhoto && (now - cachedPhoto.timestamp) < PHOTO_CACHE_DURATION) {
			reply.header("Content-Type", cachedPhoto.contentType).send(cachedPhoto.data);
			return;
		}
		
		// 캐시에 없으면 API 호출
		const { arrayBuf, contentType } = await placePhoto(String(id), String(name), w);
		const photoBuffer = Buffer.from(arrayBuf);
		
		// 사진을 캐시에 저장
		photoCache.set(photoCacheKey, { data: photoBuffer, contentType, timestamp: now });
		limitPhotoCacheSize();
		
		reply.header("Content-Type", contentType).send(photoBuffer);
	});
	app.get("/api/v1/places/:id/photos/media", async (req, reply) => {
		const { id } = (req as any).params;
		const { name, maxWidthPx } = (req as any).query ?? {};
		if (!name) {
			reply.status(400).send({ error: "name parameter is required" });
			return;
		}
		const w = maxWidthPx ? Number(maxWidthPx) : 1200;
		
		// 사진 캐시 키 생성
		const photoCacheKey = `${id}-${name}-${w}`;
		const now = Date.now();
		const cachedPhoto = photoCache.get(photoCacheKey);
		
		// 캐시된 사진이 있고 유효한 경우 반환
		if (cachedPhoto && (now - cachedPhoto.timestamp) < PHOTO_CACHE_DURATION) {
			reply.header("Content-Type", cachedPhoto.contentType).send(cachedPhoto.data);
			return;
		}
		
		// 캐시에 없으면 API 호출
		const { arrayBuf, contentType } = await placePhoto(String(id), String(name), w);
		const photoBuffer = Buffer.from(arrayBuf);
		
		// 사진을 캐시에 저장
		photoCache.set(photoCacheKey, { data: photoBuffer, contentType, timestamp: now });
		limitPhotoCacheSize();
		
		reply.header("Content-Type", contentType).send(photoBuffer);
	});

	app.get("/v1/autocomplete", async (req, reply) => {
		const { input } = (req as any).query ?? {};
		const key = process.env.GOOGLE_PLACES_BACKEND_KEY!;
		if (!input) return [];

		const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": key,
				"X-Goog-FieldMask": "suggestions.placePrediction.place, suggestions.placePrediction.text"
			},
			body: JSON.stringify({ input })
		});
		if (!res.ok) return reply.code(res.status).send(await res.text());
		const json: any = await res.json();
		return (json?.suggestions ?? []).map((s: any) => ({
			id: s.placePrediction?.place?.id,
			text: s.placePrediction?.text?.text
		}));
	});

	// 정적 데이터 반환 - 캐시 가능
	app.get("/v1/regions", async () => DISPLAY_REGIONS);


	// 최적화된 상세 정보 API
	app.get("/v1/detail/:placeId", async (req, reply) => {
		const placeId = String((req.params as any).placeId);
		const unifiedId = `google:${placeId}`;
		
		try {
			// 캐시 확인
			const cache = await prisma.placeCache.findUnique({ where: { placeId: unifiedId } });
			if (cache && Date.now() - new Date(cache.fetchedAt).getTime() < DETAIL_TTL) {
				return reply.send(cache.json);
			}
			
			// Google Places API 호출
			const raw: any = await placeDetail(placeId);
			const json: any = mapPlace(raw);
			
			// Ensure categories/types are included for frontend
			if (!json.categories && !json.types) {
				json.categories = raw?.types || [];
			}
			
			// 캐시 저장
			await prisma.placeCache.upsert({
				where: { placeId: unifiedId },
				create: { placeId: unifiedId, json },
				update: { json, fetchedAt: new Date() }
			});
			
			return reply.send(json);
		} catch (error) {
			console.error('Detail fetch error:', error);
			return reply.code(500).send({ error: "Failed to fetch place details" });
		}
	});

	app.get("/v1/recommendations", async (req, reply) => {
		try {
			const { auth } = await import('./adapters/auth/index.js');
			const userId = await auth.getUserIdFromRequest(req) || 'dev-user';
			const language = queryLanguage || req.headers['accept-language'] || 'ko';
			
			// 사용자의 좋아요 목록 조회
			const likes = await prisma.userLike.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				take: 50
			});
			
			// 태그 가중치 계산
			const weight = new Map<string, number>();
			likes.forEach((l: any) => {
				(l.tags || []).forEach((t: string) => {
					weight.set(t, (weight.get(t) || 0) + 1);
				});
			});
			
			// 상위 3개 태그로 검색
			const topTags = [...weight.entries()]
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3)
				.map(([t]) => t);
			
			const query = topTags.length ? topTags.join(' ') : '한국 관광지';
			const results = await textSearch(query, undefined, undefined, 8, language);
			
			reply.send(results || []);
		} catch (error) {
			console.error('Recommendations error:', error);
			return reply.code(500).send({ error: "Failed to get recommendations" });
		}
	});

	app.post("/v1/itineraries", async (req, reply) => {
		try {
			const { auth } = await import('./adapters/auth/index.js');
			const userId = await auth.getUserIdFromRequest(req) || 'dev-user';
			const { title, startDate, endDate, notes } = (req.body as any) || {};
			
			if (!title) {
				return reply.code(400).send({ message: 'missing title' });
			}
			
			const itinerary = await prisma.itinerary.create({
				data: {
					userId,
					title,
					startDate: startDate ? new Date(startDate) : null,
					endDate: endDate ? new Date(endDate) : null,
					notes
				}
			});
			
			reply.send(itinerary);
		} catch (error) {
			console.error('Create itinerary error:', error);
			return reply.code(500).send({ error: "Failed to create itinerary" });
		}
	});

	app.post("/v1/itineraries/:id/items", async (req, reply) => {
		try {
			const itineraryId = String((req.params as any).id);
			const { placeId, name, address, lat, lng, day, startTime, endTime, memo } = (req.body as any) || {};
			
			if (!placeId || !name) {
				return reply.code(400).send({ message: 'missing place info' });
			}
			
			const unifiedId = `google:${placeId}`;
			
			// Place 저장/업데이트
			await prisma.place.upsert({
				where: { id: unifiedId },
				create: { id: unifiedId, source: 'google', placeId, name, address, lat, lng, tags: [] },
				update: { name, address, lat, lng }
			});
			
			// ItineraryItem 생성
			const item = await prisma.itineraryItem.create({
				data: {
					itineraryId,
					placeId: unifiedId,
					day: day ?? null,
					startTime,
					endTime,
					memo
				}
			});
			
			reply.send(item);
		} catch (error) {
			console.error('Add itinerary item error:', error);
			return reply.code(500).send({ error: "Failed to add itinerary item" });
		}
	});

	// TourAPI 라우트 등록 - v1으로 통일
	await app.register(tourApiRoutes, { prefix: '/v1/tour' });
	// 임시 호환: 프론트에서 아직 /api/tour/* 를 호출하는 경우를 지원
	await app.register(tourApiRoutes, { prefix: '/api/tour' });
	// CloudFront 호환: /api/v1/tour/* 경로 지원
	await app.register(tourApiRoutes, { prefix: '/api/v1/tour' });

	return app;
}