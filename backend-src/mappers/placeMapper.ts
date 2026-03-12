export function mapPlace(p: any) {
  // Sanitize reviews - replace __ with Anonymous
  const sanitizedReviews = p.reviews?.map((review: any) => ({
    ...review,
    author: {
      displayName: review.authorAttribution?.displayName?.replace(/__/g, 'Anonymous') || 'Anonymous'
    },
    authorAttribution: {
      displayName: review.authorAttribution?.displayName?.replace(/__/g, 'Anonymous') || 'Anonymous',
      uri: review.authorAttribution?.uri,
      photoUri: review.authorAttribution?.photoUri
    },
    text: review.text?.text || "", // v1 nested structure: reviews.text.text
    rating: typeof review.rating === 'string' ? parseInt(review.rating) : review.rating,
    relativePublishTimeDescription: review.relativePublishTimeDescription,
    publishTime: review.publishTime,
    // Mock data for demonstration (Google Places API doesn't provide these directly)
    reviewCount: Math.floor(Math.random() * 50) + 1,
    photoCount: Math.floor(Math.random() * 100) + 1,
    isLocalGuide: Math.random() > 0.7 // 30% chance of being local guide
  })) || [];

  // Map opening hours from new structure (weekdayDescriptions, not weekdayText)
  const openingHours = p.currentOpeningHours?.weekdayDescriptions || p.regularOpeningHours?.weekdayDescriptions || [];

  return {
    id: p.id,
    displayName: p.displayName,
    rating: p.rating,
    userRatingCount: p.userRatingCount,
    editorialSummary: p.editorialSummary,
    reviews: sanitizedReviews,
    photos: p.photos,
    location: p.location,
    websiteUri: p.websiteUri,
    internationalPhoneNumber: p.internationalPhoneNumber,
    formattedPhoneNumber: p.internationalPhoneNumber || p.nationalPhoneNumber,
    formattedAddress: p.formattedAddress,
    openingHours: {
      weekdayDescriptions: openingHours
    },
    businessStatus: p.businessStatus,
    priceLevel: p.priceLevel,
    types: p.types
  };
}
