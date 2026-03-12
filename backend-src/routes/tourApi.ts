import { FastifyInstance } from 'fastify';
import { 
  getAreaBasedList, 
  getLocationBasedList, 
  getRestaurants,
  getAccommodations,
  getCafes,
  TourItem
} from '../tourApiClient.js';


export default async function tourApiRoutes(fastify: FastifyInstance) {
  // 지역기반 관광지 목록 조회
  fastify.get('/area-based', async (request, reply) => {
    try {
      const { 
        areaCode = '1', 
        contentTypeId = '12', 
        numOfRows = 10, 
        pageNo = 1 
      } = request.query as any;

      const items = await getAreaBasedList(areaCode, contentTypeId, numOfRows, pageNo);
      
      return {
        success: true,
        data: items,
        count: items.length
      };
    } catch (error) {
      fastify.log.error('Area based list error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch area based list'
      });
    }
  });

  // 좌표반경 관광지 검색
  fastify.get('/location-based', async (request, reply) => {
    try {
      const { 
        mapX, 
        mapY, 
        radius = 1000, 
        contentTypeId = '12', 
        numOfRows = 10,
        lang
      } = request.query as any;

      if (!mapX || !mapY) {
        return reply.status(400).send({
          success: false,
          error: 'mapX and mapY are required'
        });
      }

      const items = await getLocationBasedList(
        parseFloat(mapX), 
        parseFloat(mapY), 
        parseInt(radius), 
        contentTypeId, 
        parseInt(numOfRows),
        lang
      );
      
      return {
        success: true,
        data: items,
        count: items.length
      };
    } catch (error) {
      fastify.log.error('Location based list error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch location based list'
      });
    }
  });



  // 강남구 주변 관광지 검색 (특화)
  fastify.get('/gangnam', async (request, reply) => {
    try {
      // 강남구 중심 좌표 (코엑스 근처)
      const gangnamCenter = {
        mapX: 127.0592, // 경도
        mapY: 37.5115   // 위도
      };

      const { radius = 2000, contentTypeId = '12', numOfRows = 20 } = request.query as any;

      const items = await getLocationBasedList(
        gangnamCenter.mapX,
        gangnamCenter.mapY,
        parseInt(radius),
        contentTypeId,
        parseInt(numOfRows)
      );
      
      return {
        success: true,
        data: items,
        count: items.length,
        center: gangnamCenter
      };
    } catch (error) {
      fastify.log.error('Gangnam tour list error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch Gangnam tour list'
      });
    }
  });

  // 맛집 검색
  fastify.get('/restaurants', async (request, reply) => {
    try {
      const { mapX, mapY, radius = 2000, numOfRows = 10, lang } = request.query as any;

      if (!mapX || !mapY) {
        return reply.status(400).send({
          success: false,
          error: 'mapX and mapY are required'
        });
      }

      const items = await getRestaurants(
        parseFloat(mapX),
        parseFloat(mapY),
        parseInt(radius),
        parseInt(numOfRows),
        lang
      );
      
      return {
        success: true,
        data: items,
        count: items.length
      };
    } catch (error) {
      fastify.log.error('Restaurants error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch restaurants'
      });
    }
  });

  // 숙소 검색
  fastify.get('/accommodations', async (request, reply) => {
    try {
      const { mapX, mapY, radius = 2000, numOfRows = 10, lang } = request.query as any;

      if (!mapX || !mapY) {
        return reply.status(400).send({
          success: false,
          error: 'mapX and mapY are required'
        });
      }

      const items = await getAccommodations(
        parseFloat(mapX),
        parseFloat(mapY),
        parseInt(radius),
        parseInt(numOfRows),
        lang
      );
      
      return {
        success: true,
        data: items,
        count: items.length
      };
    } catch (error) {
      fastify.log.error('Accommodations error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch accommodations'
      });
    }
  });

  // 카페 검색
  fastify.get('/cafes', async (request, reply) => {
    try {
      const { mapX, mapY, radius = 2000, numOfRows = 10 } = request.query as any;

      if (!mapX || !mapY) {
        return reply.status(400).send({
          success: false,
          error: 'mapX and mapY are required'
        });
      }

      const items = await getCafes(
        parseFloat(mapX),
        parseFloat(mapY),
        parseInt(radius),
        parseInt(numOfRows)
      );
      
      return {
        success: true,
        data: items,
        count: items.length
      };
    } catch (error) {
      fastify.log.error('Cafes error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch cafes'
      });
    }
  });

}
