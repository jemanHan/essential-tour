import { FastifyInstance } from 'fastify';

// Simple in-memory cache with TTL
interface CacheEntry {
  data: Buffer;
  contentType: string;
  timestamp: number;
}

const photoCache = new Map<string, CacheEntry>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of photoCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      photoCache.delete(key);
    }
  }
}

// Clean cache every hour
setInterval(cleanExpiredCache, 60 * 60 * 1000);

export async function placesRoutes(fastify: FastifyInstance) {
  // Get place photo from Google Places API
  fastify.get('/places/:placeId/photo', async (request, reply) => {
    try {
      const { placeId } = request.params as { placeId: string };
      
      if (!placeId) {
        return reply.code(400).send({ error: 'placeId is required' });
      }

      // Check cache first
      const cacheKey = `photo_${placeId}`;
      const cached = photoCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return reply
          .type(cached.contentType)
          .send(cached.data);
      }

      const apiKey = process.env.GOOGLE_PLACES_BACKEND_KEY;
      if (!apiKey) {
        return reply.code(500).send({ error: 'Google Places API key not configured' });
      }

      // Step 1: Get place details to fetch photo name
      const placeUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=photos.name`;
      
      const placeResponse = await fetch(placeUrl, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!placeResponse.ok) {
        console.error('Google Places API error:', placeResponse.status, placeResponse.statusText);
        return reply.code(placeResponse.status).send({ 
          error: 'Failed to fetch place details',
          status: placeResponse.status 
        });
      }

      const placeData = await placeResponse.json();
      
      if (!placeData.photos || placeData.photos.length === 0) {
        return reply.code(404).send({ error: 'No photos available for this place' });
      }

      const photoName = placeData.photos[0].name;
      if (!photoName) {
        return reply.code(404).send({ error: 'Photo name not found' });
      }

      // Step 2: Fetch the actual photo
      const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800`;
      
      const photoResponse = await fetch(photoUrl, {
        headers: {
          'X-Goog-Api-Key': apiKey
        }
      });

      if (!photoResponse.ok) {
        console.error('Google Places Photo API error:', photoResponse.status, photoResponse.statusText);
        return reply.code(photoResponse.status).send({ 
          error: 'Failed to fetch photo',
          status: photoResponse.status 
        });
      }

      const photoBuffer = await photoResponse.arrayBuffer();
      const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

      // Cache the result
      photoCache.set(cacheKey, {
        data: Buffer.from(photoBuffer),
        contentType,
        timestamp: Date.now()
      });

      return reply
        .type(contentType)
        .send(Buffer.from(photoBuffer));

    } catch (error) {
      console.error('Photo fetch error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
