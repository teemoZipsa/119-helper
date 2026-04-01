export interface FireWaterFacility {
  fcltyNo?: string;        // 시설번호
  ctprvnNm?: string;       // 시도명
  signguNm?: string;       // 시군구명
  rdnmadr?: string;        // 소재지도로명주소
  lnmadr?: string;         // 소재지지번주소
  latitude?: string;       // 위도
  longitude?: string;      // 경도
  fcltyKndNm?: string;     // 시설유형명 (소화전, 급수탑, 저수조 등)
  insptnSttusNm?: string;  // 점검상태명 (정상, 고장 등)
}

const API_KEY = import.meta.env.VITE_FIRE_WATER_API_KEY;

export async function fetchFireWaterFacilities(cityQuery: string): Promise<FireWaterFacility[]> {
  const cityMap: Record<string, string> = {
    seoul: '서울특별시', busan: '부산광역시', daegu: '대구광역시',
    incheon: '인천광역시', gwangju: '광주광역시', daejeon: '대전광역시',
    ulsan: '울산광역시', sejong: '세종특별자치시', jeju: '제주특별자치도'
  };
  const searchCity = cityMap[cityQuery] || '서울특별시';

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo: '1',
    numOfRows: '50000', // 한 도시를 덮을 만큼의 넉넉한 량
    type: 'json',
    ctprvnNm: searchCity
  });

  const targetUrl = `https://api.data.go.kr/openapi/tn_pubr_public_ffus_wtrcns_api?${params.toString()}`;

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error('Direct fetch failed');
    const data = await res.json();
    let items = data?.response?.body?.items || [];
    
    items = items.filter((item: FireWaterFacility) => 
      (item.ctprvnNm && item.ctprvnNm.includes(searchCity)) ||
      (item.rdnmadr && item.rdnmadr.includes(searchCity)) ||
      (item.lnmadr && item.lnmadr.includes(searchCity))
    );
    return items;
  } catch (err) {
    console.warn('직접 호출 실패, 프록시(allorigins) 경유 시도:', err);
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const pRes = await fetch(proxyUrl);
      const pData = await pRes.json();
      let pItems = pData?.response?.body?.items || [];
      pItems = pItems.filter((item: FireWaterFacility) => 
        (item.ctprvnNm && item.ctprvnNm.includes(searchCity)) ||
        (item.rdnmadr && item.rdnmadr.includes(searchCity)) ||
        (item.lnmadr && item.lnmadr.includes(searchCity))
      );
      return pItems;
    } catch (e2) {
      console.error('소방용수시설 데이터 로드 실패', e2);
      return [];
    }
  }
}

