type Props = { regions: string[]; onPick: (q: string) => void; current?: string };
export default function RegionGrid({ regions, onPick, current="전체" }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4">지역</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {regions.map(r => {
          const active = (current || "전체") === r;
          return (
            <button key={r} onClick={() => onPick(r)}
              className={`px-3 py-3 rounded-xl ${active ? "bg-black text-white" : "bg-base-200 hover:bg-base-300"}`}>
              {r}
            </button>
          );
        })}
      </div>
    </section>
  );
}
