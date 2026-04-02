// 지진해일 긴급 대피장소 API — Cloudflare Worker 프록시 경유

import { fetchShelters } from './apiClient';

export interface ShelterData {
  shelterName: string;     // 대피장소명
  address: string;         // 도로명상세주소
  capacity: number;        // 수용인원
  altitude: number;        // 해발고도
  isUsable: boolean;       // 사용여부
  lat: number;             // 위도
  lng: number;             // 경도
  distance?: number;       // 현재 위치로부터 거리 (km) — 클라이언트 계산
}

// 시도 영문 → 한글 매핑
const CITY_TO_CTPRVN: Record<string, string> = {
  seoul: '서울특별시', busan: '부산광역시', daegu: '대구광역시',
  incheon: '인천광역시', gwangju: '광주광역시', daejeon: '대전광역시',
  ulsan: '울산광역시', sejong: '세종특별자치시', jeju: '제주특별자치도',
  gyeonggi: '경기도', gangwon: '강원특별자치도',
  chungbuk: '충청북도', chungnam: '충청남도',
  jeonbuk: '전북특별자치도', jeonnam: '전라남도',
  gyeongbuk: '경상북도', gyeongnam: '경상남도',
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getShelters(cityKey: string, userLat?: number, userLng?: number): Promise<ShelterData[]> {
  const ctprvnNm = CITY_TO_CTPRVN[cityKey] || '서울특별시';

  try {
    const items = await fetchShelters(ctprvnNm, '', '200');

    const shelters: ShelterData[] = items
      .map((item: any) => {
        const lat = parseFloat(item.lat || item.latitude || '0');
        const lng = parseFloat(item.lot || item.longitude || item.lon || '0');
        if (!lat || !lng) return null;

        const shelter: ShelterData = {
          shelterName: item.shelterNm || item.shelterName || item.shltNm || '무명 대피소',
          address: item.rdnmadr || item.lnmadr || item.dtlAdres || '주소 미상',
          capacity: parseInt(item.shltSeCo || item.acmPrsnCo || item.capacity || '0') || 0,
          altitude: parseFloat(item.seaLvlHght || item.altitude || '0') || 0,
          isUsable: item.useYn !== 'N',
          lat,
          lng,
        };

        if (userLat && userLng) {
          shelter.distance = Math.round(haversineDistance(userLat, userLng, lat, lng) * 10) / 10;
        }

        return shelter;
      })
      .filter((s: ShelterData | null): s is ShelterData => s !== null && s.isUsable);

    // 거리 순 정렬 (GPS 있을 때)
    if (userLat && userLng) {
      shelters.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return shelters;
  } catch (e) {
    console.error('대피소 데이터 조회 실패:', e);
    return [];
  }
}

export { CITY_TO_CTPRVN };
