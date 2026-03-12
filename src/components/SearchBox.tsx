import { useEffect, useRef } from 'react'
import { googleLoader } from '../lib/googleLoader'

export default function SearchBox() {
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		;(async () => {
			const google = await googleLoader.load()
			// PlaceAutocompleteElement (권장)로 마이그레이션
			// @ts-ignore - provided by Maps JS runtime
			const { PlaceAutocompleteElement } = google.maps.places as any
			if (PlaceAutocompleteElement) {
				const el = document.createElement('gmp-place-autocomplete') as any
				el.addEventListener('gmp-placeselect', async (e: any) => {
					const place = e?.detail?.place;
					const id = place?.id || place?.place_id;
					if (!id) return;
					// API 호출 제거 - 무한루프 방지
					// const base = import.meta.env.VITE_API_BASE_URL as string
					// const res = await fetch(`${base}/v1/places/${encodeURIComponent(id)}`)
					// const data = await res.json()
				})
				// input을 감싸서 대체
				inputRef.current!.replaceWith(el)
			} else {
				// 구버전 Fallback: Autocomplete (경고 발생 가능)
				const ac = new google.maps.places.Autocomplete(inputRef.current!, {
					fields: ['place_id', 'name', 'geometry'],
				})
				ac.addListener('place_changed', async () => {
					const p = ac.getPlace()
					if (!p || !p.place_id) return
					// API 호출 제거 - 무한루프 방지
					// const base = import.meta.env.VITE_API_BASE_URL as string
					// const res = await fetch(`${base}/v1/places/${encodeURIComponent(p.place_id)}`)
					// const data = await res.json()
				})
			}
		})()
	}, [])

	return <input ref={inputRef} placeholder="Search places…" style={{ width: '100%', padding: 8 }} />
}


