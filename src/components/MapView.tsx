import { useEffect, useRef } from 'react'
import { googleLoader } from '../lib/googleLoader'

export default function MapView() {
	const divRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		;(async () => {
			const google = await googleLoader.load()
			const map = new google.maps.Map(divRef.current!, {
				center: { lat: 37.5665, lng: 126.9780 },
				zoom: 12,
			})
			// AdvancedMarkerElement (권장)
			// @ts-ignore - type is provided by Maps JS runtime
			const { AdvancedMarkerElement } = (google.maps as any).marker || {}
			if (AdvancedMarkerElement) {
				new AdvancedMarkerElement({ map, position: map.getCenter()! })
			} else {
				// fallback for older runtime
				new google.maps.Marker({ position: map.getCenter()!, map })
			}
		})()
	}, [])

	return <div ref={divRef} style={{ width: '100%', height: 400 }} />
}


