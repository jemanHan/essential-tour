import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type PlaceItem = {
  id: string;
  displayName: any;
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string }[];
  editorialSummary?: any;
};

export default function HomePage() {
  const [items, setItems] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(6);
  const [allItems, setAllItems] = useState<PlaceItem[]>([]);

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? "https://hello-korea.link";
      const url = new URL("/v1/search", base);
      // No default query: server should return recommended list when q is absent.
      const res = await fetch(url.toString());
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data?.places ?? []);
      setAllItems(arr);
      setItems(arr.slice(0, displayCount));
    } finally {
      setLoading(false);
    }
  }

  function photoUrl(place: PlaceItem, maxWidthPx = 600) {
    if (!place.photos?.[0]?.name) return null;
    const base = import.meta.env.VITE_API_BASE_URL ?? "https://hello-korea.link";
    const u = new URL(`/v1/places/${encodeURIComponent(place.id)}/photos/media`, base);
    u.searchParams.set("name", place.photos[0].name);           // pass full photo resource name
    u.searchParams.set("maxWidthPx", String(maxWidthPx));
    return u.toString();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title only; map/search removed */}
      <h1 className="text-3xl font-bold mb-6">추천 여행지</h1>

      {loading ? (
        <div className="text-center">불러오는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => {
              const img = photoUrl(p);
              return (
                <div key={p.id} className="card bg-base-100 shadow-xl">
                  <figure>
                                      {img ? (
                    <img src={img} alt={typeof p.displayName === 'object' ? p.displayName?.text : p.displayName ?? '이름 없음'} />
                  ) : (
                      <div className="w-full h-48 bg-base-200 flex items-center justify-center">
                        이미지 없음
                      </div>
                    )}
                  </figure>
                                  <div className="card-body">
                  <h2 className="card-title">{typeof p.displayName === 'object' ? p.displayName?.text : p.displayName ?? '이름 없음'}</h2>
                  <p className="text-sm opacity-80">
                    평점: {p.rating ?? "-"} ({p.userRatingCount ?? 0})
                  </p>

                  {/* brief description on the card */}
                  {p.editorialSummary ? (
                    <p className="text-sm">{typeof p.editorialSummary === 'object' ? p.editorialSummary?.text : p.editorialSummary}</p>
                  ) : null}

                  <div className="card-actions justify-end">
                    {/* On Details, keep same brief description even without backend */}
                    <Link
                      to={`/places/${p.id}`}
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (p.editorialSummary) {
                          const desc = typeof p.editorialSummary === 'object' ? p.editorialSummary?.text : p.editorialSummary;
                          if (desc) {
                            sessionStorage.setItem(`fallback-desc:${p.id}`, desc);
                          }
                        }
                      }}
                    >
                      자세히
                    </Link>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
          
          {/* Load more button */}
          {allItems.length > displayCount && (
            <div className="text-center mt-8">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const newCount = Math.min(displayCount + 6, allItems.length);
                  setDisplayCount(newCount);
                  setItems(allItems.slice(0, newCount));
                }}
              >
                더 보기 ({displayCount}/{allItems.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}


