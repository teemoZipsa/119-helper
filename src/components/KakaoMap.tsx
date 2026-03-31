import { useRef, useEffect } from 'react';
import type { FireFacility } from '../data/mockData';

// 도시별 중심 좌표
const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  seoul: { lat: 37.5665, lng: 126.978 },
  busan: { lat: 35.1796, lng: 129.0756 },
  daegu: { lat: 35.8714, lng: 128.6014 },
  incheon: { lat: 37.4563, lng: 126.7052 },
  gwangju: { lat: 35.1595, lng: 126.8526 },
  daejeon: { lat: 36.3504, lng: 127.3845 },
  ulsan: { lat: 35.5384, lng: 129.3114 },
  sejong: { lat: 36.48, lng: 127.0 },
  jeju: { lat: 33.4996, lng: 126.5312 },
};

// 상태별 마커 색상
const STATUS_COLORS: Record<string, string> = {
  '정상': '#34d399',
  '점검필요': '#fbbf24',
  '고장': '#ef4444',
};

interface KakaoMapProps {
  data: FireFacility[];
  city: string;
  height?: string;
  selectedId?: string | null;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ data, city, height = '300px', selectedId }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const overlaysRef = useRef<Map<string, any>>(new Map());

  // 지도 초기화
  useEffect(() => {
    if (!containerRef.current || !window.kakao?.maps) return;

    const center = CITY_CENTERS[city] || CITY_CENTERS.seoul;
    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: 7,
    };

    const map = new window.kakao.maps.Map(containerRef.current, options);
    mapRef.current = map;

    // 줌 컨트롤
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

    return () => {
      markersRef.current = new Map();
      overlaysRef.current = new Map();
    };
  }, []);

  // 도시 변경 시 중심 이동
  useEffect(() => {
    if (!mapRef.current) return;
    const center = CITY_CENTERS[city] || CITY_CENTERS.seoul;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
  }, [city]);

  // 마커 렌더링
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;
    const map = mapRef.current;

    // 기존 마커/오버레이 제거
    markersRef.current.forEach(m => m.setMap(null));
    overlaysRef.current.forEach(o => o.setMap(null));
    markersRef.current = new Map();
    overlaysRef.current = new Map();

    data.forEach(item => {
      const position = new window.kakao.maps.LatLng(item.lat, item.lng);
      const color = STATUS_COLORS[item.status] || '#9ca3af';

      // SVG 마커 이미지
      const markerSize = new window.kakao.maps.Size(24, 35);
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 23 12 23s12-14 12-23C24 5.4 18.6 0 12 0z" fill="${color}"/>
          <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
        </svg>
      `;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const markerImage = new window.kakao.maps.MarkerImage(url, markerSize);

      const marker = new window.kakao.maps.Marker({
        map,
        position,
        image: markerImage,
        title: item.id,
      });

      // 커스텀 오버레이 (클릭 시 표시)
      const overlayContent = `
        <div style="
          background: #0f1629;
          border: 1px solid ${color}40;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          min-width: 200px;
          font-family: 'Inter', sans-serif;
          position: relative;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="
              display: inline-block;
              width: 8px; height: 8px;
              border-radius: 50%;
              background: ${color};
              ${item.status === '고장' ? 'animation: pulse 1.5s infinite;' : ''}
            "></span>
            <span style="color: #e5e7eb; font-weight: 800; font-size: 14px;">${item.id}</span>
            <span style="
              font-size: 10px;
              padding: 2px 8px;
              border-radius: 9999px;
              background: ${color}20;
              color: ${color};
              font-weight: 700;
              border: 1px solid ${color}40;
            ">${item.status}</span>
          </div>
          <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px;">${item.type}</p>
          <p style="color: #e5e7eb; font-size: 12px; margin: 0; line-height: 1.4;">${item.address}</p>
          <div style="
            position: absolute;
            bottom: -8px; left: 50%;
            transform: translateX(-50%);
            width: 0; height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #0f1629;
          "></div>
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        content: overlayContent,
        position,
        yAnchor: 1.5,
        zIndex: 10,
      });

      // 클릭 토글
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 오버레이 모두 닫기
        overlaysRef.current.forEach(o => o.setMap(null));
        overlay.setMap(map);
        map.panTo(position);
      });

      markersRef.current.set(item.id, marker);
      overlaysRef.current.set(item.id, overlay);
    });

    // Bounds 맞추기 (데이터가 있을 때)
    if (data.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      data.forEach(item => {
        bounds.extend(new window.kakao.maps.LatLng(item.lat, item.lng));
      });
      map.setBounds(bounds);
    }
  }, [data, city]);

  // 외부에서 selectedId 변경 시 해당 마커 포커스
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;

    const overlay = overlaysRef.current.get(selectedId);
    const marker = markersRef.current.get(selectedId);
    if (!overlay || !marker) return;

    // 다른 오버레이 닫기
    overlaysRef.current.forEach(o => o.setMap(null));
    // 해당 마커에 오버레이 표시 + 이동
    overlay.setMap(mapRef.current);
    mapRef.current.panTo(marker.getPosition());
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height }}
      className="rounded-xl overflow-hidden"
    />
  );
}
